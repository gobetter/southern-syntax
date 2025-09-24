# @southern-syntax/domain-admin

## Purpose
Domain services that power the admin backend (roles, users, media, products, etc.). Wraps Prisma access with business rules and auditing.

## Responsibilities
- Role management (`roleService`) with RBAC enforcement and audit logging
- User management helpers, content/media domain logic
- Coordinate cache invalidation via `@southern-syntax/auth/utils`

## Usage notes
- Access services through exported modules (e.g. `import { roleService } from '@southern-syntax/domain-admin/role'`)
- Unit tests live in `packages/domain-admin/src/__tests__`
- Requires `@southern-syntax/db`, `@southern-syntax/auth`, and constants packages
