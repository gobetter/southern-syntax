import prisma, { Prisma } from "@southern-syntax/db";
import type { PrismaTypes } from "@southern-syntax/db";
import { defaultLocale } from "@southern-syntax/config";

import type {
  AuthenticatedUser,
  LocalizedString,
  RegisteredUser,
} from "@southern-syntax/types";

import {
  CredentialsInput,
  credentialsSchema,
  registerSchema,
  RegisterInput,
} from "./schemas";
import { verifyPassword, hashPassword } from "./utils";

const isDebug: boolean =
  process.env.NEXTAUTH_DEBUG === "true" ||
  process.env.NODE_ENV !== "production";

const log = (...args: unknown[]): void => {
  if (isDebug) console.log("[auth:service]", ...args);
};
const logWarn = (...args: unknown[]): void => {
  console.warn("[auth:service]", ...args);
};
const logError = (...args: unknown[]): void => {
  console.error("[auth:service]", ...args);
};

const isLocalizedString = (v: unknown): v is LocalizedString =>
  typeof v === "object" &&
  v !== null &&
  !Array.isArray(v) &&
  Object.values(v as Record<string, unknown>).every(
    (x) => typeof x === "string"
  );

const toLocalizedOrString = (
  v: PrismaTypes.JsonValue | null
): LocalizedString | string | null => {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (isLocalizedString(v)) return v;
  return null;
};

export async function authenticateUser(
  credentials: CredentialsInput
): Promise<AuthenticatedUser | null> {
  log("[authenticateUser] input", { email: credentials?.email });

  const validated = credentialsSchema.safeParse(credentials);
  if (!validated.success) {
    logWarn("[authenticateUser] invalid credentials schema", {
      issues: validated.error.issues.length,
    });
    return null;
  }

  const { email, password } = validated.data;
  const normalizedEmail = email.trim().toLowerCase();

  type UserWithRole = PrismaTypes.UserGetPayload<{ include: { role: true } }>;

  let user: UserWithRole | null = null;
  try {
    user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { role: true },
    });
    log("[authenticateUser] user fetched", {
      exists: Boolean(user),
      id: user?.id ?? null,
      role: user?.role?.key ?? null,
      isActive: user?.isActive ?? null,
      hasHash: Boolean(user?.passwordHash),
    });
  } catch (error: unknown) {
    logError("[authenticateUser] DB error", error);
    throw new Error("DB_CONNECTION_ERROR");
  }

  if (!user) {
    logWarn("[authenticateUser] user not found", { email: normalizedEmail });
    return null;
  }

  if (!user.isActive) {
    logWarn("[authenticateUser] inactive user", { id: user.id });
    return null;
  }

  if (!user.passwordHash) {
    logWarn("[authenticateUser] missing passwordHash", { id: user.id });
    return null;
  }

  const ok = await verifyPassword(password, user.passwordHash);
  log("[authenticateUser] password verify", { id: user.id, ok });

  if (!ok) {
    logWarn("[authenticateUser] wrong password", { id: user.id });
    return null;
  }

  log("[authenticateUser] success", {
    id: user.id,
    role: user.role?.key ?? null,
  });
  return {
    id: user.id,
    name: toLocalizedOrString(user.name),
    email: user.email ?? "",
    role: user.role?.key ?? null,
  };
}

export async function registerUser(
  input: RegisterInput
): Promise<RegisteredUser> {
  const data = registerSchema.parse(input);
  const email = data.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    logWarn("[registerUser] email exists", { email });
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  try {
    const created = await prisma.user.create({
      data: {
        email,
        name: { [defaultLocale]: data.name },
        roleId: data.roleId ?? null,
        passwordHash: await hashPassword(data.password),
      },
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        isActive: true,
      },
    });

    log("[registerUser] created", { id: created.id, email: created.email });
    return {
      id: created.id,
      email: created.email,
      name: created.name as unknown as LocalizedString | string | null,
      roleId: created.roleId,
      isActive: created.isActive,
    };
  } catch (e: unknown) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      logWarn("[registerUser] prisma unique constraint", { email });
      throw new Error("EMAIL_ALREADY_EXISTS");
    }
    logError("[registerUser] error", e);
    throw e;
  }
}
