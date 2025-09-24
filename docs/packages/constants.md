# @southern-syntax/constants

## Purpose
Holds cross-application constant values (audit action identifiers, locale lists, etc.).

## Responsibilities
- Provide deterministic string enums/objects consumed by services/apps
- Avoid magic strings scattered through the codebase

## Usage notes
- Import the needed constant (e.g. `AUDIT_ACTIONS`) and keep additions documented
- Typecheck/lint via workspace commands (`pnpm --filter @southern-syntax/constants …`)
