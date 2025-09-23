# Package Conventions

This repository follows a single package layout template so every app and library looks and behaves the same. The checklist below applies to everything under `apps/*` and `packages/*` unless noted otherwise.

## Directory Layout

```
<package>/
├── package.json          # Scripts + metadata (see below)
├── src/                  # Source files – public entry point at src/index.ts
├── dist/                 # Build output (gitignored)
├── tsconfig.json         # Extends @southern-syntax/tsconfig/*
├── tsconfig.build.json   # Optional, only when a custom build pipeline is needed
├── eslint.config.mjs     # Optional, overrides repo defaults when required
├── README.md             # Optional but recommended – document package purpose
└── tests/ or __tests__/  # Optional – colocated test files are also fine
```

Exceptions:
- Configuration-only packages (for example `@southern-syntax/tsconfig` or `@southern-syntax/eslint-config-custom`) may expose JSON/JS files at the root instead of a `src` directory. They should still document their purpose and keep scripts consistent with this guide where it makes sense.
- Next.js applications keep their app-specific structure (e.g. `app/`, `public/`). They still conform to the scripts and TypeScript configuration rules below.

## Required npm Scripts

Every TypeScript package/library must expose the following scripts. The commands should stay consistent so Turborepo caching behaves predictably.

| Script        | Command                                               | Purpose                             |
| ------------- | ----------------------------------------------------- | ----------------------------------- |
| `clean`       | `rimraf dist`                                         | Remove build output before a fresh build |
| `build`       | `tsc -b` (or project-specific build command)          | Emit JavaScript and declaration files |
| `typecheck`   | `tsc -b --pretty false`                               | Type-check without emitting files   |
| `lint`        | `eslint . --max-warnings=0`                           | Lint with zero-warning policy       |
| `check-types` | `pnpm typecheck`                                      | Provide a uniform hook for turbo tasks |

Packages can add more scripts (e.g. `prepack`, `test`, `generate`, `postbuild`) but they should **not** redefine the semantics above. If a package needs a different build pipeline, wrap it inside the prescribed script name instead of inventing a new one.

Applications follow the same rule for `typecheck`, `lint`, and `check-types`. They should also define `dev`, `build`, and `start` as usual for Next.js apps.

## TypeScript Configuration

- `tsconfig.json` must extend one of the shared presets under `@southern-syntax/tsconfig`.
- Library packages emit to `dist/`, use `rootDir: "src"`, and enable project references when they depend on other workspace packages.
- Use `tsBuildInfoFile: "dist/.tsbuildinfo"` so incremental builds stay inside the build folder.
- Any extra TypeScript config (e.g. `tsconfig.vitest.json`, `tsconfig.lint.json`) must extend from the main package config.

## Build & Distribution

- The package `files` field should include `dist` (or other generated artifacts) so publishing/packaging stays deterministic.
- Avoid committing build output. The `.gitignore` inside each package should cover `dist/` if extra ignores are required.
- When a package ships assets (translations, SQL migrations, etc.), document the build step in the package `README.md` and ensure the assets are copied during the `build` script.

## Testing & Tooling

- Co-located tests inside `src/**/__tests__` are acceptable. Alternatively, create a top-level `tests/` directory.
- Prefer Vitest for unit tests in libraries and keep the entry command under an explicit `test` script.
- Reuse the shared ESLint config. If a package needs overrides, place an `eslint.config.mjs` at the package root and import from `@southern-syntax/eslint-config-custom`.

Keeping every workspace package consistent makes it easier to onboard new apps, share tooling, and let Turborepo cache aggressively.
