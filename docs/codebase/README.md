# Glim Codebase Documentation

> Glim is a browser extension for analyzing website information at a glance — IP geolocation, HTTP security headers, social meta tags, and more.

## Documentation Index

| Document | Description |
|----------|-------------|
| [OVERVIEW.md](./OVERVIEW.md) | Project overview, directory structure, key components, tech stack |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Data flow diagrams, message passing, state management, animation system |

## Quick Links

- **Tech Stack**: WXT + React 19 + TypeScript + Tailwind CSS v4
- **Entry Points**: `entrypoints/background.ts`, `entrypoints/content.ts`, `entrypoints/popup/`
- **Commands**: `pnpm dev` (dev), `pnpm build` (build), `pnpm compile` (type-check)
