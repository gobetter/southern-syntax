# @southern-syntax/types

## Purpose
Shared TypeScript type definitions/interfaces that don't belong to a specific package.

## Responsibilities
- Provide cross-cutting types (DTOs, enums, utility types)
- Avoid circular dependencies by isolating pure typings

## Usage notes
- Import the declared type from this package rather than redefining
- Keep types aligned with schemas/domain logic
