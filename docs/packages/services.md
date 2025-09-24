# @southern-syntax/services

## Purpose
Client-facing service layer for API calls/business logic that sits between routes and domain packages.

## Responsibilities
- Coordinate calls to Prisma/domain packages (`@southern-syntax/domain-admin`, etc.)
- Contain higher-level business workflows consumable by tRPC routers or server actions

## Usage notes
- Import specific service modules (e.g. `languageService`) for use inside tRPC/router handlers
- Keep service functions thin; heavy business logic belongs in domain packages
