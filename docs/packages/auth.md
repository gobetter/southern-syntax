# @southern-syntax/auth

## Purpose
Shared authentication and authorization toolkit for server/runtime usage. Provides password hashing helpers, NextAuth utilities, and RBAC-aware permission checks.

## Responsibilities
- Hash/verify user passwords (bcrypt)
- Expose RBAC `can` helper wired to the central RBAC config
- Manage a configurable permissions cache (`configurePermissionsCache`)
- Supply role-related schemas/options for NextAuth

## Key dependencies
- `@southern-syntax/db` for Prisma access
- `@southern-syntax/rbac` for permission metadata
- `@southern-syntax/i18n` for auth-related messaging

## Usage notes
- Import `can`, `getUserPermissions`, etc. from `@southern-syntax/auth`
- Configure cache at bootstrap: `configurePermissionsCache({ adapter, defaultTtlMs })`
- Invalidate caches via `invalidateUserPermissions` & `invalidatePermissionsByRole`
- Maintains Vitest unit coverage (`pnpm --filter @southern-syntax/auth test`)
