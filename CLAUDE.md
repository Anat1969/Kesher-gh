# CLAUDE.md — Working agreement for this project

## Workflow (standing instruction from the owner)

- The owner builds the base version of each project in **Lovable**, which syncs it to GitHub.
- Claude's job in every session: **take the project from "level 1" to "level 999"** — the most
  advanced, polished version possible — using the owner's available skills and the newest
  features and best practices. Do this proactively in every session, without being asked again.
- The owner has many projects following this same workflow.

## What "upgrade" means here

Work through these areas, highest impact first, and verify each change (lint, typecheck, tests, build):

1. **Correctness & quality** — fix bugs, add tests (Vitest), tighten TypeScript, clean lint.
2. **UX & design** — polished, responsive, mobile-first, RTL-correct Hebrew UI, dark mode,
   smooth animations, accessibility (keyboard, ARIA, contrast).
3. **Features** — modern capabilities that fit the product (e.g. PWA/offline, sharing,
   persistence, stats, sound/haptics, i18n) — chosen to suit the app, not bolted on.
4. **Performance** — code splitting, small bundles, fast first load.
5. **Engineering** — up-to-date dependencies, CI, clear README.

Relevant skills to use: `engineering:code-review`, `engineering:testing-strategy`,
`engineering:tech-debt`, `simplify`, `security-review`, `run` (to see the app working),
`artifact-design` / `dataviz` for visual work.

## Lovable compatibility rules

- Lovable syncs the default branch; do the upgrade work on a feature branch and let the owner merge.
- Keep the Lovable stack intact (Vite + React + TypeScript + Tailwind + shadcn/ui) so the
  project can keep being edited in Lovable after the upgrade.
- Don't rename/move core entry files (`index.html`, `src/main.tsx`, `src/App.tsx`).

## Communication

- The owner writes in Hebrew — reply in Hebrew.
