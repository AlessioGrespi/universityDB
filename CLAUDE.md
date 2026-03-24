## Project Configuration

- **Language**: TypeScript
- **Package Manager**: pnpm
- **Add-ons**: prettier, eslint, tailwindcss, drizzle, mcp

---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UniversityDB is a web application serving as a directory of university courses, modules, academics, and research. The project is being rebuilt from a clean slate.

### Prior Tech Stack (for reference when rebuilding)

The previous iteration used:

- **SvelteKit** (Svelte 4) as the full-stack framework
- **Drizzle ORM** with **PostgreSQL** for the database
- **Tailwind CSS** (v3) with the typography plugin for styling
- **Vite** for bundling, **Vitest** for unit tests, **Playwright** for integration tests
- **Prettier** + **ESLint** for formatting/linting
- **D3** and **Chart.js** for data visualization
- **Lucide Svelte** for icons
- **@tanstack/svelte-table** for data tables
- Deployed with **Vercel** (adapter-auto, @vercel/analytics)

## Common Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build
npm run check            # Svelte type checking
npm run lint             # Prettier + ESLint check
npm run format           # Auto-format with Prettier
npm run test:unit        # Run unit tests (vitest)
npm run test:integration # Run integration tests (playwright)
npm run test             # Run all tests
npm run db:push          # Push Drizzle schema to DB
npm run db:migrate       # Run Drizzle migrations
npm run db:studio        # Open Drizzle Studio GUI
```

## Environment Setup

Requires a `DATABASE_URL` environment variable pointing to a PostgreSQL instance. Copy `.env.example` to `.env` and fill in credentials.

## Architecture

- `src/routes/` — SvelteKit file-based routing. Entity pages (courses, modules, lecturers) each have index (`+page.svelte`) and detail (`[slug]/+page.svelte`) routes.
- `src/routes/**/+page.server.ts` — Server-side data loading with Drizzle queries.
- `src/lib/server/db/schema.ts` — Drizzle ORM schema definitions (PostgreSQL).
- `src/lib/server/db/index.ts` — Database connection setup.
- `src/lib/components/` — Shared Svelte components.
- `drizzle.config.ts` — Drizzle Kit configuration (reads `DATABASE_URL`).
- `src/app.css` — Global styles (Tailwind base).

## Key Patterns

- Data fetching happens in `+page.server.ts` files using Drizzle ORM, passed to Svelte pages as props.
- Entity detail pages use dynamic route params (e.g., `[course]`, `[lecturer]`, `[module]`).
- The database dialect is PostgreSQL — use `pg-core` imports from Drizzle.
