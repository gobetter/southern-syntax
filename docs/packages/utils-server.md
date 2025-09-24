# @southern-syntax/utils-server

## Purpose
Server-side utilities (FormData parsing, Supabase helpers, crypto hashing, etc.).

## Responsibilities
- Provide Node-only helpers and wrappers for third-party SDKs
- Complement `@southern-syntax/utils` with server-specific functionality

## Usage notes
- Import from this package in API routes, tRPC routers, or scripts that run in Node
- Do not import in client bundles as functions may rely on Node globals
