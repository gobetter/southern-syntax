# @southern-syntax/eslint-config-custom

## Purpose
Central ESLint configuration presets shared by all packages/apps.

## Responsibilities
- Provide base lint rules (TypeScript + Unicorn + custom)
- Export configs consumed by `eslint.config.mjs`

## Usage notes
- Extend the base config from other workspaces via `import base from '@southern-syntax/eslint-config-custom/base'`
- Adjust rules in this package when global lint behaviour changes
