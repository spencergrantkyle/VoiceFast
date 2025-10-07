# Repository Guidelines

## Project Structure & Module Organization
- Core agent logic lives in `agent.ts`, `notion-integration.ts`, and the Telegram entry points in the repository root.
- CLI helpers reside in `scripts/` (`run-agent.ts`, `get-telegram-chat-id.ts`) and are run via `npm run ...` scripts.
- Documentation and operational playbooks are under `docs/`; keep new guides there and cross-link from `README.md`.
- Web assets for hosted interfaces live in `static/`; generated transcripts or artifacts should stay in `output/` or `temp/` and never be committed.

## Build, Test, and Development Commands
- `npm install` — install dependencies (run after cloning or when package.json changes).
- `npm run dev` — hot-reloads the agent loop in `scripts/run-agent.ts` for local iteration.
- `npm run bot` / `npm run bot:webhook` — start the Telegram bot in polling or webhook mode; use the `:dev` variants for watch mode.
- `npm run type-check` — strict TypeScript compile without emitting files; required before every PR.
- `npm run build` — compiles to `dist/`; run before deployments and whenever changing build-critical code.

## Coding Style & Naming Conventions
- Use TypeScript with ES2022 modules; prefer async/await and typed Zod schemas for validation.
- Follow the existing two-space indentation and keep lines under 120 characters.
- Name files and exports with lower-case kebab or camel case (`telegram-bot-webhook.ts`, `loadNotionClient`).
- Surface shared utilities instead of duplicating logic; colocate feature-specific helpers next to the entry point they support.

## Testing Guidelines
- No automated test harness exists yet; rely on `npm run type-check` plus targeted manual flows (Telegram webhook/polling and Notion sync).
- When adding features, script reproducible scenarios in `scripts/` and document validation steps in the PR description.
- Capture and sanitize sample payloads in `temp/` when troubleshooting; avoid committing personal data.

## Commit & Pull Request Guidelines
- Follow the imperative, single-line subject style seen in git history (e.g., `Add Notion link to Telegram success message`).
- Group related changes per commit; include config or schema updates in the same commit as their usage.
- PRs should explain intent, call out environment or migration steps, link related tickets, and attach Telegram/Notion screenshots when behavior changes.
- Ensure CI prerequisites (type-check, build, manual verification notes) are completed before requesting review.

## Configuration & Secrets
- Store secrets in `.env` following `README.md` guidance; never commit `.env` or raw keys.
- Update `README.md` and relevant docs when introducing new environment variables or integration steps.
