# Southern Syntax Monorepo

This repository hosts the `trang-pepper-website` application alongside a set
of reusable packages managed with [Turborepo](https://turbo.build/repo). The
packages can be shared with additional apps in the future.

## Apps and Packages

- `trang-pepper-website`: a [Next.js](https://nextjs.org/) application
- `@southern-syntax/auth`: authentication helpers
- `@southern-syntax/db`: Prisma database client
- `@southern-syntax/i18n`: internationalisation utilities
- `@southern-syntax/schemas`: common Zod schemas
- `@southern-syntax/types`: shared TypeScript types
- `@southern-syntax/ui`: React UI components
- `@southern-syntax/utils`: general utilities
- `@southern-syntax/utils-server`: server runtime utilities (busboy, Supabase, hashing)
- `@southern-syntax/utils-client`: browser runtime utilities
- `@southern-syntax/domain-admin`: admin domain services (media, products, roles, users, etc.)
- `@southern-syntax/trpc`: shared tRPC context & middleware helpers
- `@southern-syntax/eslint-config-custom`: shared ESLint configuration
- `@southern-syntax/tsconfig`: base TypeScript configurations

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

## Conventions & Docs

- [`docs/package-conventions.md`](docs/package-conventions.md) — shared folder
  layout and required npm scripts across apps and packages.
- [`docs/rbac-guide.md`](docs/rbac-guide.md) — step-by-step guide for updating
  permissions, roles, and locale translations while keeping the database and
  caches aligned.

## RBAC & Localisation Workflow

RBAC is centralised inside `packages/rbac/src/config.ts` and mirrored in the
translations located under `packages/i18n/src/messages`. When you add or modify
resources/roles:

1. Update the RBAC config (labels, descriptions, role presets) and refresh
   translations.
2. Rerun the Prisma seed (`pnpm --filter @southern-syntax/db db:seed`) to
   reconcile permission records.
3. Regenerate caches in the running app by calling `configurePermissionsCache`
   if you changed TTL or adapter behaviour.
4. Audit the final permissions with `pnpm report:permissions`.

See the [RBAC guide](docs/rbac-guide.md) for detailed steps.

### Permissions cache

The authentication package exposes a configurable permissions cache:

```ts
import {
  configurePermissionsCache,
  InMemoryPermissionsCache,
} from "@southern-syntax/auth";

configurePermissionsCache({
  defaultTtlMs: 60_000,
  adapter: new InMemoryPermissionsCache(),
});
```

- Set `PERMISSIONS_CACHE_TTL_MS` to override the default TTL (5 minutes).
- Provide your own adapter (e.g. Redis) that implements the
  `PermissionsCacheAdapter` contract.

## Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Build

To build all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

## Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

## Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)

## Useful scripts

- `pnpm report:permissions` — prints the complete list of RBAC permissions and
  default role presets for auditing or documentation.
