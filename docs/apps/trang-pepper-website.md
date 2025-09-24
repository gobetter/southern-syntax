# trang-pepper-website

## Purpose
Next.js 14+ application that delivers the Trang Pepper marketing/admin experience. It consumes shared packages from this monorepo for authentication, RBAC, UI, i18n, and data access.

## Responsibilities
- User-facing pages (marketing + admin dashboard) rendered through the App Router
- Admin workflows (roles, users, content) using tRPC APIs
- Locale-aware UI via `next-intl` and the shared i18n package
- Authentication integration with `@southern-syntax/auth`

## Key dependencies
- `@southern-syntax/trpc` for context/procedure helpers
- `@southern-syntax/ui` for component primitives
- `@southern-syntax/auth` for session utilities and RBAC checks
- `@southern-syntax/i18n` for translation loading

## Usage notes
- Start with `pnpm --filter trang-pepper-website dev`
- Type checking: `pnpm --filter trang-pepper-website typecheck`
- Tests rely on Vitest + React Testing Library (`pnpm --filter trang-pepper-website test`)
- Next.js configuration lives in `apps/trang-pepper-website/next.config.mjs`
