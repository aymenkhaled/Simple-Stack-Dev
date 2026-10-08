# Simple Stack Dev

A TypeScript/pnpm monorepo with API, mobile, and mockup workspaces.

## Repository layout
- `artifacts/api-server/`
- `artifacts/mobile/`
- `artifacts/mockup-sandbox/`
- `lib/`
- `scripts/`

## Build and checks
Use **pnpm** (required by the root package configuration).

```bash
pnpm install
pnpm run typecheck
pnpm run build
```

Use the app-specific workspace scripts to run or test individual pieces.

## Status
Development workspace. This README documents the verified repository structure and commands; product features and a public demo have not been verified.
