# @southern-syntax/trpc

## Purpose
Shared tRPC setup: context creation, authentication middleware, and permission-aware procedure builders.

## Responsibilities
- Provide `createTRPCContext`, `router`, `protectedProcedure`, `authorizedProcedure`
- Re-export RBAC enums/schemas for router usage
- Connect Prisma + session retrieval for server-side handlers

## Usage notes
- Import from this package when defining routers (`apps/trang-pepper-website/src/server/routers`)
- Use `authorizedProcedure(resource, action)` to gate endpoints with RBAC checks
- Context relies on `@southern-syntax/auth/server` for session retrieval
