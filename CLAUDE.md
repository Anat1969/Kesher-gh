# CLAUDE.md — Working agreement for this project

## Workflow (standing instruction from the owner)

- The owner builds the base version of each project in **Lovable**, which syncs it to GitHub.
- Claude's job in every session: **take the project from "level 1" to "level 999"** — the most
  advanced, polished version possible — using the owner's available skills and the newest
  features and best practices. Do this proactively in every session, without being asked again.
- The owner has many projects following this same workflow.

## Owner corrections (apply every session)

- "Level 999" is the default for every request, including "just give me a link": every delivery
  carries a full UI/UX and graphics upgrade, never the level-1 state as-is. (2026-10-26)
- Design must be sophisticated, never childish (2026-10-26, "הגרפיקה על הפנים"): editorial and
  architectural, like a museum catalogue or a drawing set. No emoji anywhere in the UI (the cards are
  words set in type, each with its hairline glyph from `src/components/Glyph.tsx`: imagery matters,
  2026-10-26 "חשוב תמונה"; content glyphs are drawn in the drafting language, never emoji or stock icons), no toy 3D, no glow, no bouncy springs, no saturated colours. Hairline rules,
  restrained depth (one soft shadow), muted level colours, IBM Plex Sans Hebrew light/thin, IBM Plex
  Mono numerals and labels, slow precise motion.
- Fixed top bar on every page: app name links home, content nav, and the A&I logo button
  (`<ai-menu>` from https://appofapp-gh.vercel.app/ai-menu.js, wrapper in `src/components/AIMenu.tsx`).
  Preferences (appearance, sound, haptics) live inside the A&I menu, never as loose buttons.
- Content (2026-10-26): every explanation is pair-specific, built from `src/game/lexicon.ts`
  (essence, process, paradox and a line per tag for each card). A level is awarded only when its
  definition in `src/game/levelInfo.ts` is met, and each reading states why ("למה דרש?").
  Sod only for a documented secret or a shared paradox, never as a fallback. Show the alternative
  readings and let the player say what they meant or write their own; that shapes the thinking
  profile, never the score. Facts in hand-crafted readings must be checked (names, dates, numbers).
- Readable in a second (2026-10-27, repeated owner instruction for every app): text is read with
  the eyes, not the head. Mark the insight and the key words of every text with the yellow
  highlighter (`**phrase**` in content strings, rendered by `src/components/Rich.tsx`; `.hl` in JSX).
  Lead with the insight, keep rationales to one short sentence, cut anything that needs re-reading.
- Imagery (2026-10-27): card drawings are soft, free, hand-drawn gold lines with a light gold wash
  (`Glyph` tone="gold", `--gold`). The board shows images only; names are an option in the A&I
  menu and appear on the selected card. App icon and share image use the same gold-on-ink language.
- Game controls (2026-10-27): a "הצגת שמות / הסתרת שמות" button sits by the legend (owner asked
  for a button; names show small and grey under each drawing). The clock has a direct "עצירה /
  המשך" control in the instrument panel; while stopped a veil hides the board (no free thinking time).
- Daily challenge (2026-10-27): same start, target and 5-link length for everyone each day
  (`src/game/daily.ts`, seeded by date), no clock, last link must land on the target, score shown
  against the day's computed maximum and its best chain; results kept per day in localStorage.
- Grids that hold long text need `grid-cols-[minmax(0,1fr)]`, or mobile scrolls sideways.

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

## Design language 2 (owner's choice for this project)

- **Light and dark themes**, switchable (light / dark / system), both first-class.
- **The tool is black, white and neutral greys only** (saturation 0): backgrounds, surfaces,
  text, buttons, borders, icons, timers, progress bars, dialogs.
- **Colour belongs only to the content** — here: card emoji, the four connection levels
  (pshat/remez/drash/sod), connection lines and chain links. This contrast is the point:
  it makes the content stand out from the tool.
- Tokens live in `src/index.css` (`:root` = light, `.dark` = dark); never hard-code chrome colours.

## Lovable compatibility rules

- Lovable syncs the default branch; do the upgrade work on a feature branch, open a PR and merge it
  after green checks (the owner gave standing approval). Vercel deploys main to https://kesher-gh.vercel.app
- Keep the Lovable stack intact (Vite + React + TypeScript + Tailwind + shadcn/ui) so the
  project can keep being edited in Lovable after the upgrade.
- Don't rename/move core entry files (`index.html`, `src/main.tsx`, `src/App.tsx`).

## Verification

- Before pushing: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` must all pass
  (CI in `.github/workflows/ci.yml` runs the same).
- Check the UI in a real browser (Playwright, phone and desktop sizes) — Lovable exports often have
  visual bugs (RTL/bidi, colours built from CSS variables) that only show when rendered.
- `bun.lock` can't be refreshed from the cloud sandbox; `package-lock.json` is the source of truth there.

## Communication

- The owner writes in Hebrew — reply in Hebrew.
