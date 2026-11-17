# CLAUDE.md: working rules for this repo

Read this before changing code (people and AI assistants alike).

## What this is
CareCircle, Team 312's Demo Day product (TECH 5900, Cornell Tech). React + TypeScript + Vite, deployed free on Vercel. Mobile-first, iPhone-only team. **Demo data only** (Ana, Elena, Luca). See README.md for the full picture.

## Commands
- `npm run dev` runs the local dev server.
- `npm run build` type-checks and builds; it must pass before every commit.
- `npm run lint` runs oxlint.

## UI rules
- **Match the Figma exactly** (file `UNy0iGfSEzyws5eKAVXxOD`). Font Inter; colors only via the variables in `src/styles/tokens.css`. Never hardcode a hex value in a component.
- **Reuse components.** Primitives live in `src/components/ui/primitives.tsx`, layout in `src/components/layout/layout.tsx`, product pieces in `src/components/domain/`. If you write the same markup twice, make it a component.
- Every screen renders inside `<Page>`. Use `tabs={false}` for flow screens (scan, review, settings sub-pages).
- Screens live in `src/screens/`, one per file, and the comment at the top names the Figma frame (e.g. `/** 05 — Review details */`).
- The real-vs-sample choice cards must stay **visually identical** (Experiment 2 measures which one people pick).

## Backend rules
- The **only** boundary between UI and backend is `src/api/contract.ts` (`CareCircleApi`). Screens call `api.*` (via the store), never `fetch` directly.
- Change the contract first, then update `mockApi.ts` and the UI in the same PR.
- The backend stack is UJ's and Zoe's decision. Don't add backend dependencies to the UI.

## HIPAA and privacy (non-negotiable)
- **Not HIPAA compliant. No real patient information**, ever, in code, fixtures, logs, screenshots or issues.
- Free-tier vendors don't sign BAAs, so never upload real medical documents to a deployed build.
- Delete document photos right after extraction unless `keepPhoto` is true (default false).
- `logEvent` props are ids and booleans only, never document text or names.
- Don't use any AI service whose terms let it train on our inputs: the privacy screen promises "Never used to train AI."

## Scope guard (Demo Day rubric)
Build only what serves: the working P0 flow (scan → review → reminder), privacy controls, and behavioral event logging. Wearables, Ask, language settings, payments and real accounts are **"What's next"**: show them as coming soon, don't build them.

## Git
- Branch from `main`; open a PR; Vercel posts a preview URL on the PR.
- Keep PRs small; `npm run build` must pass.
