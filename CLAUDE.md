# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

단어장 (Word Log) — a personal Korean vocabulary/phrase log with spaced-repetition flashcard training. Static, no-build, no-dependency PWA: `index.html` + `app.js` + `styles.css`, no framework, no bundler, no package.json.

## Running it

There is no build/test/lint tooling. Open `index.html` directly in a browser, or serve the folder with any static file server (needed for the PWA manifest/service-worker-style behavior to work correctly, e.g. `npx serve` or `python -m http.server`). Changes to `app.js`/`styles.css`/`index.html` take effect on reload — no compile step. `index.html` loads them with a `?v=` version tag: bump it whenever those files change, or browsers can pair a new `index.html` with a cached old script and break.

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

**UI is built around memory strength** — an entry's Leitner box (0–5) is shown everywhere as a 5-dot meter plus a status (`statusOf()`: new / fading / back in N days). The log defaults to `fading` sort (`fadingOrder()`: due reviewed words weakest-first, then new, then by return date); the first chip cycles the sort. A banner (`renderFadeBanner()`, refreshed from `updateDueDot()`) offers a one-tap review of what's due. Edit/delete sit behind each card's ⋯ menu. The streak flame's ring is the daily goal (`renderDaily()`). During a session `.app.in-session` hides the header/banner/tabs; Danno sits beside the card and reacts (`dannoReact()` — hop on got it, curl up on not quite, lean in on reveal); rating buttons show what each choice does (`daysText()` of the next box interval). The summary lists each word's strength change from `session.results`. Example sentences use `findWord()` so short words only match as whole words (물 must not match 물러서). Select & share is launched from settings. Fonts: Inter for UI, Noto Sans KR for Korean; no third face.

**Theming** — `applyTheme()` sets `data-theme="light|dark"` on `<html>` (or follows `prefers-color-scheme` when set to `auto`); `styles.css` defines colour tokens on `:root` and redefines them under `:root[data-theme="dark"]` (dark mode has real dark cards). Light mode's ground is the brand blue with white cards; both have the same hills along the bottom as the foyer.

**Foyer** (`foyer.js`, loaded after `app.js` and using its globals; GSAP from cdnjs) — the welcome screen shown on every open and when the topbar logo is tapped. The app is for retention, so it leads with what's fading: the due count, a "review now" button that starts a session directly, and one quick rep on the due word with the lowest box (rating it goes through `applySrsRating`/`bumpDaily`/`bumpStreak` like a training card). Every open starts with only Danno asleep (`.is-asleep` is set in the markup so the first paint is right, and the rest of the foyer is `display:none` so he stays centred); tapping him *is* logging in: 단어장 rises out of a blur syllable by syllable, he hops to his feet, then the wipe goes straight into the log (beat timings are listed above `wakeUp()`). The logo keeps its space while hidden so Danno never shifts. The foyer's greeting, quick rep and buttons only show when returning via the topbar logo (short entrance). Tapping awake Danno makes him hop or peek. Leaving the foyer is a two-tone wipe: a gold band then a paper band with rounded ends sweep left to right across the screen and off the other side (transform-only); the app is swapped in while the paper band covers everything. Danno's idle breathing is a CSS animation (`.danno.idle`), not a GSAP `repeat: -1` tween: infinite tweens crash Chrome when the global timeline is retimed. Danno is the real drawings from the character sheet, one PNG per pose in `danno/` on a shared 300×500 canvas with feet on the same baseline. Pose swaps are instant, so always hide them inside fast motion (a squash or the top of a hop). Respects `prefers-reduced-motion`.

## Notes from recent history

- Category matching must stay word-boundary, not substring (see `CATEGORY_PATTERNS`).
- Klipy is the current GIF provider; don't reintroduce Tenor.
- Backup export/import (`exportBackupBtn`/`importBackupBtn`) is the only migration/portability path — it round-trips the full `entries` array as JSON and merges by `id` on import, prompting to merge vs. replace when IDs collide.
