# @southern-syntax/utils-client

## Purpose
Browser-only utilities that rely on DOM APIs or client environment features.

## Responsibilities
- Provide helpers that cannot run on the server (localStorage, window sizing, etc.)

## Usage notes
- Ensure code importing these utilities executes only on the client (e.g. inside `useEffect`)
- Avoid using in Node.js contexts
