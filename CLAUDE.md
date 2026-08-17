# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

단어장 (Word Log) — a personal Korean vocabulary/phrase log with spaced-repetition flashcard training. Static, no-build, no-dependency PWA: `index.html` + `app.js` + `styles.css`, no framework, no bundler, no package.json.

## Running it

There is no build/test/lint tooling. Open `index.html` directly in a browser, or serve the folder with any static file server (needed for the PWA manifest/service-worker-style behavior to work correctly, e.g. `npx serve` or `python -m http.server`). Changes to `app.js`/`styles.css`/`index.html` take effect on reload — no compile step.

## Architecture (all logic lives in `app.js`, organized in commented sections)

**Data model & persistence** — everything is `localStorage`, no backend/server:
- `koWordLog.v1` — the `entries` array, each `{ id, korean, romanized, meaning, category, createdAt, srs }`
- `koWordLog.settings.v1` — theme/sort/dailyGoal/API keys
- `koWordLog.streak.v1`, `koWordLog.daily.v1` — streak and daily-goal tracking
- `migrateSrs()` backfills the `srs` field for entries created before spaced-repetition was added; runs on every load and after backup import, so new persisted fields need a similar migration guard rather than assuming all entries have them.

**Add flow** (`handleAdd`) — one input accepts either Korean or English. It detects which via `hasHangul()`, then:
1. Romanizes Korean input locally via a hand-rolled Revised Romanization implementation (`romanize`/`decompose`, no library) — handles syllable-final consonant linking onto a following null-onset syllable.
2. Auto-translates the other direction using MyMemory's free API (`translate()`, no key required).
3. If translation fails, falls back to `openManualRow()` for manual entry rather than blocking the add.
4. Auto-categorizes the entry from its English meaning via whole-word regex matching against `CATEGORY_KEYWORDS` (`autoCategorize`) — deliberately word-boundary (`\b...\b`), not substring, since substring matching previously miscategorized "money" as "numbers" via "one".

**Training / spaced repetition** — a Leitner-box system (`BOX_INTERVALS`, `applySrsRating`): wrong answers reset to box 0 and are requeued once within the same session; correct answers advance a box and push `dueAt` further out. Grading is self-reported (user clicks "got it"/"not quite") rather than string-matched, since free-form translations have too many valid phrasings to auto-grade. A training session (`session` object: `queue`/`index`/`tally`/`requeued`) is built by `buildSessionQueue()`, prioritizing due cards.

**Enrichment on answer reveal** (`revealCard`) — two independent, best-effort, non-blocking fetches keyed off `ratingRow.dataset.entryId` so a slow response arriving after the user has moved to the next card is discarded:
- Word GIF via Klipy's `gifs/search` endpoint (Tenor's replacement; Tenor shut down 2026-06-30) — requires a user-supplied API key stored in settings. `findMediaUrl()` walks the response recursively looking for an image/video URL instead of hardcoding a field path, because Klipy's exact response shape isn't fully documented.
- Example sentence via Tatoeba first (no key, returns matched KO/EN pairs directly), falling back to KRDict (needs a user key, XML response, Korean-only — its English gloss is produced by running the result through the same `translate()` helper).

API keys (Klipy, KRDict) are stored in `localStorage` only, never sent anywhere but the respective API. The settings UI flags keys containing non-ASCII characters as likely mangled by mobile autocorrect/autocapitalize.

**Rendering** — no framework; `renderLog()`/`renderChips()`/`buildEntryCard()` rebuild DOM from the `entries` array on every mutation. All user-provided text is inserted via `escapeHtml()` before going into `innerHTML` — preserve this when touching card rendering or edit-mode markup.

**Theming** — `applyTheme()` sets `data-theme="light|dark"` on `<html>` (or follows `prefers-color-scheme` when set to `auto`); `styles.css` keys dark-mode overrides off `:root[data-theme="dark"]` selectors throughout.

## Notes from recent history

- Category matching must stay word-boundary, not substring (see `CATEGORY_PATTERNS`).
- Klipy is the current GIF provider; don't reintroduce Tenor.
- Backup export/import (`exportBackupBtn`/`importBackupBtn`) is the only migration/portability path — it round-trips the full `entries` array as JSON and merges by `id` on import, prompting to merge vs. replace when IDs collide.
