# RBAC and Locale Workflow

This project centralises every permission, role preset, and translation key in
`packages/rbac/src/config.ts`. Follow the steps below whenever you introduce a
new resource, action, or role.

## 1. Update the RBAC configuration

- Declare the resource inside `PERMISSION_RESOURCE_DEFINITIONS`.
  - Provide a `labelKey` / `descriptionKey` so the UI can translate it.
  - Prefer the shared action arrays (`ACTION_SET_*`) instead of repeating
    literal lists.
- Adjust `ROLE_DEFINITIONS` to grant the appropriate default permissions.
- Add or update unit tests in `packages/rbac/src/__tests__/config.test.ts` to
  cover the new behaviour.

## 2. Localise the metadata

- Add the translation keys referenced above into
  `packages/i18n/src/messages/common/{lang}.json`.
- When introducing a brand-new locale, run
  `pnpm scaffold:locale <locale> --skip-db` to generate the message scaffold.

## 3. Reseed and reconcile the database

- Run `pnpm --filter @southern-syntax/db db:generate` (or `pnpm db:generate`)
  to regenerate Prisma types if you changed schema.
- Execute the seed script so permissions/roles stay in sync:
  `pnpm --filter @southern-syntax/db db:seed`.
  - The seed now removes stale permission records automatically.
  - Ensure `SUPERADMIN_*` environment variables are set before seeding.

## 4. Refresh application caches

- There is an environment-aware permissions cache controlled by
  `configurePermissionsCache`. Set `PERMISSIONS_CACHE_TTL_MS` (in milliseconds)
  and, if needed, swap in a custom adapter.
- The `invalidatePermissionsByRole` helper performs batched cache invalidation.
  Ensure your adapters implement `deleteMany` for best performance.

## 5. Verify and audit

- Run the automated suite: `pnpm lint && pnpm typecheck && pnpm test`.
- Use `pnpm report:permissions` to print the current list of permissions and
  role presets. This is useful for release notes and manual QA.

Keeping these steps in mind guarantees that the admin UI, the database, and the
runtime caches remain consistent whenever RBAC rules evolve.
