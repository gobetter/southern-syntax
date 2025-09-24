# @southern-syntax/utils

## Purpose
General-purpose utility functions for shared use in both server and client environments (framework agnostic).

## Responsibilities
- Provide pure functions/helpers (formatting, data transforms, etc.)
- Avoid heavy dependencies and side effects

## Usage notes
- Import specific utilities as needed; keeping modules small aids tree-shaking
- If a util requires DOM/Window, place it in `utils-client`; for Node APIs use `utils-server`
