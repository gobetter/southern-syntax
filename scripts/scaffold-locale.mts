#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { promises as fs } from "node:fs";

import {
  locales as currentLocales,
  defaultLocale as currentDefaultLocale,
} from "../packages/config/src/constants";

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  const options: {
    locale?: string;
    name?: string;
    copyFrom?: string;
    setDefault?: boolean;
    skipDb?: boolean;
  } = {};

  while (args.length > 0) {
    const token = args.shift();
    if (!token) break;

    if (!token.startsWith("--")) {
      options.locale = token;
      continue;
    }

    const [flag, value] = token.split("=");
    switch (flag) {
      case "--name":
        options.name = value ?? args.shift();
        break;
      case "--copy-from":
        options.copyFrom = value ?? args.shift();
        break;
      case "--set-default":
        options.setDefault = true;
        break;
      case "--skip-db":
        options.skipDb = true;
        break;
      default:
        throw new Error(`Unknown flag: ${flag}`);
    }
  }

  if (!options.locale) {
    throw new Error("Usage: pnpm tsx scripts/scaffold-locale.mts <locale> [--name=<display>] [--copy-from=en] [--set-default] [--skip-db]");
  }

  options.locale = options.locale.toLowerCase();
  if (!/^[a-z]{2}(-[a-z]{2})?$/i.test(options.locale)) {
    throw new Error("Locale code must match xx or xx-YY format");
  }

  if (!options.copyFrom) {
    options.copyFrom = currentDefaultLocale;
  }

  return options;
}

async function updateConfigFile(rootDir: string, locale: string, setDefault: boolean) {
  const configPath = join(rootDir, "packages/config/src/constants.ts");
  const existingLocales = [...currentLocales];
  if (!existingLocales.includes(locale as (typeof currentLocales)[number])) {
    existingLocales.push(locale as (typeof currentLocales)[number]);
  }

  const nextDefault = setDefault ? locale : currentDefaultLocale;
  const localesLiteral = existingLocales.map((code) => `"${code}"`).join(", ");

  const content = `export const defaultLocale = "${nextDefault}";\nexport const locales = [${localesLiteral}] as const;\n`;
  await fs.writeFile(configPath, `${content}`);

  return { locales: existingLocales, defaultLocale: nextDefault };
}

async function scaffoldMessageFiles(
  rootDir: string,
  locale: string,
  copyFrom: string
) {
  const messagesDir = join(rootDir, "packages/i18n/src/messages");
  const entries = await fs.readdir(messagesDir, { withFileTypes: true });
  const namespaces = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  await Promise.all(
    namespaces.map(async (namespace) => {
      const namespaceDir = join(messagesDir, namespace);
      const templatePath = join(namespaceDir, `${copyFrom}.json`);
      const targetPath = join(namespaceDir, `${locale}.json`);

      try {
        await fs.access(targetPath);
        // eslint-disable-next-line no-console
        console.log(`• ${relative(rootDir, targetPath)} already exists, skipping.`);
        return;
      } catch {
        /* continue */
      }

      const template = await fs.readFile(templatePath, "utf8");
      await fs.writeFile(targetPath, template, "utf8");
      // eslint-disable-next-line no-console
      console.log(`• Created ${relative(rootDir, targetPath)}`);
    })
  );

  const importLines: string[] = [];
  const objectLines: string[] = [];

  namespaces.forEach((namespace) => {
    const identifier = namespace.replace(/[-.]/g, "_");
    importLines.push(
      `import ${identifier} from "./${namespace}/${locale}.json";`
    );

    if (namespace === "common") {
      objectLines.push(`  common: common as CommonMessages,`);
    } else {
      objectLines.push(`  ${identifier},`);
    }
  });

  const aggregatorPath = join(messagesDir, `${locale}.ts`);
  const importsBlock = [`import type { MessageCatalog } from "./en";`];
  if (namespaces.includes("common")) {
    importsBlock.push(`import { type CommonMessages } from "@southern-syntax/types";`);
  }

  const aggregatorContent = `${importsBlock.join("\n")}\n\n${importLines.join("\n")}\n\nconst messages = {\n${objectLines.join("\n")}\n} satisfies MessageCatalog;\n\nexport default messages;\n`;

  await fs.writeFile(aggregatorPath, aggregatorContent, "utf8");
  // eslint-disable-next-line no-console
  console.log(`• Wrote ${relative(rootDir, aggregatorPath)}`);
}

async function seedDatabase(locale: string, name: string, setDefault: boolean) {
  const { prisma } = await import("@southern-syntax/db");

  const displayName = name || locale.toUpperCase();
  await prisma.language.upsert({
    where: { code: locale },
    update: {
      name: displayName,
      isDefault: setDefault,
      isActive: true,
    },
    create: {
      code: locale,
      name: displayName,
      isDefault: setDefault,
      isActive: true,
    },
  });

  if (setDefault) {
    await prisma.language.updateMany({
      where: { code: { not: locale }, isDefault: true },
      data: { isDefault: false },
    });
  }

  // eslint-disable-next-line no-console
  console.log(`• Upserted language '${locale}' in database.`);
}

async function main() {
  const options = parseArgs(process.argv);
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const rootDir = join(__dirname, "../");

  const { locale, name, copyFrom, setDefault = false, skipDb = false } = options;

  if (!currentLocales.includes(copyFrom as (typeof currentLocales)[number])) {
    throw new Error(`Cannot copy from locale '${copyFrom}'. Available: ${currentLocales.join(", ")}`);
  }

  const localeAlreadyExists = currentLocales.includes(
    locale as (typeof currentLocales)[number]
  );
  if (localeAlreadyExists) {
    // eslint-disable-next-line no-console
    console.log(`Locale '${locale}' already present in configuration.`);
  }

  await updateConfigFile(rootDir, locale, setDefault);
  await scaffoldMessageFiles(rootDir, locale, copyFrom);

  if (!skipDb) {
    await seedDatabase(locale, name ?? "", setDefault);
  }

  // eslint-disable-next-line no-console
  console.log(
    `✅ Locale '${locale}' scaffolded successfully${skipDb ? " (database skipped)" : ""}.`
  );
}

main().catch((error) => {
  console.error(`❌ ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
