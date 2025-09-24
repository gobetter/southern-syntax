# @southern-syntax/tsconfig

## Purpose
Central TypeScript configurations (base + variants) used by all packages/apps.

## Responsibilities
- Export `base.json` and other presets consumed via `extends`
- Keep compiler options consistent across the monorepo

## Usage notes
- In package `tsconfig.json`, extend `@southern-syntax/tsconfig/base.json`
- Update shared options here when TypeScript settings need to change globally
