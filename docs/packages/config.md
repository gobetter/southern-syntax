# @southern-syntax/config

## Purpose
Environment configuration helpers shared across apps/packages. Centralises reading `.env` values with typed accessors.

## Responsibilities
- Define schema for required env vars (Zod-based)
- Expose `getConfig()` utilities for server/runtime usage
- Provide defaults/safety checks for optional settings

## Usage notes
- Import `getServerConfig`, etc. when a package requires env awareness
- Ensure CI/secrets define the variables documented in `README.md`
- Typecheck via `pnpm --filter @southern-syntax/config typecheck`
