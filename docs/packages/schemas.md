# @southern-syntax/schemas

## Purpose
Central repository of Zod schemas shared across services and apps for validation and typing.

## Responsibilities
- Define common request/response contracts
- Provide reusable schema fragments (ID params, pagination, etc.)
- Export inferred TypeScript types for downstream packages

## Usage notes
- Import the schema or type from this package instead of redefining in apps
- Keep schemas in sync with database/domain logic to avoid drift
