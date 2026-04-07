# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### MoodDrop — Mobile App (`artifacts/mobile`)
- **Type**: Expo (React Native)
- **Framework**: Expo Router, React Native, TypeScript
- **State**: AsyncStorage for local persistence (no backend needed)
- **Features**:
  - Drop screen: Pick mood level 1-5 (Rough/Low/Okay/Good/Great) + optional note
  - History screen: Timeline grouped by date with long-press to delete
  - Insights screen: 7-day bar chart + stats (streak, best day, average)
- **Dependencies**: @react-native-async-storage/async-storage, expo-haptics, react-native-reanimated

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
