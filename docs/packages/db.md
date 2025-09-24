# @southern-syntax/db

## Purpose
Prisma access layer shared across services and apps.

## Responsibilities
- Expose a singleton `prisma` client
- Provide migration/seed scripts (`pnpm --filter @southern-syntax/db db:generate`, `db:seed`)
- Handle DB-specific helpers (transactions, raw queries when necessary)

## Usage notes
- Always import `prisma` from this package to reuse the shared client
- Seeds rely on RBAC config to sync permissions/roles; run after RBAC changes
- Environment variables (`DATABASE_URL`) must be configured before running
