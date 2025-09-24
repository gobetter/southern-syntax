# @southern-syntax/hooks-next

## Purpose
Next.js-specific hooks that rely on App Router or Next APIs (e.g., router helpers, session hooks).

## Responsibilities
- Wrap Next.js utilities with project-specific logic
- Complement `@southern-syntax/hooks` for framework-aware scenarios

## Usage notes
- These hooks assume a Next.js environment; avoid using them in plain React apps
- Published as ESM with TypeScript types, run tests via `pnpm --filter @southern-syntax/hooks-next test`
