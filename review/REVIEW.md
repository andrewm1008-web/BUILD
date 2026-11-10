# BUILD v7 (0.17.0-preview) review

Patch: `build-v7-fix.patch` (apply inside `BUILD/app` with `git apply`). Nothing committed or published.

## Baseline
- `npm ci`, `npm --prefix app test` 61 pass; with my test 62 pass.
- `npm test` 36 pass, 1 skipped (it ran here; the handover said it could not).
- `npm run build` validates the Worker. `app/tests/browser.cjs` passes (real Chromium).

## Fixed
1. **Activity CSV dates shift by a day** (`app/data.js`, `activitiesCSV`). A non-ISO date such as `Jan 6, 2026, 11:30:00 PM` was parsed as local time, then cut with `toISOString()` (UTC). Repro: `TZ=America/Los_Angeles` gives Jan 7; `TZ=Pacific/Auckland` gives Jan 5 for a 7am run. A wrong date makes the run match the wrong session. It now uses local calendar parts. The new test in `tests/imports.test.cjs` fails without the fix in LA and passes in UTC, Auckland, LA and London.

## Checked, no defect found
- CSV and JSON fixtures, plan with no dates, blank distances (kept as no distance), explicit `0` (kept), reload. Without a start date the Activity tab says to add one in Settings and the import data is intact.
- Strava mocks: duplicate syncs, an activity edited upstream (the review snapshot and notes are kept), activity removed upstream (kept locally), 401 (shows Connect Strava), 502 with an HTML body, reload. Review and match identity survive. Progress is the same after reload.
- Backup export, wipe, restore: assessments, metrics and plan are identical. Notes with quotes and HTML, RPE and a `0` distance are kept. Light and dark appearance.
- No horizontal overflow at 375px on Home, Plan, Review or Progress.

## Open issues (not changed)
1. **(Fixed in a later commit.)** Importing a plan used to delete every review; it now keeps reviews whose `week|day|title` still exists. Original note: **Importing a plan deletes every review** (`workflow-client.js`, `confirmPlan`: `assessments={}`). Only a text warning guards it. Suggest keeping reviews whose `week|day|title` key survives, or forcing a backup first.
2. **Scope drift.** The plan builder, plan generator and race picker (`plan-generator*.js`, `race-picker-client.js`, "Make a plan for me") conflict with the handover scope.
3. **Fragile load order.** `render()` runs many times at load, and `sessionSheet` is wrapped 4 times across files. `openQuickMatch` in `workflow-client.js` is dead (overridden at `design-client.js:44`). `strava-client.js`, `analysis-client.js`, `styles.css` and `extras.css` are not loaded.
4. `worker/routes.js` `/api/health` reports version `0.13.0`.
5. Some touch targets are under 40px (7 on Home, 12 on Progress at 375px). I did not identify which ones.
6. `saveReview` silently deletes another session's review if the run is already linked to it. I could not reach this path in the UI.

## Not run
Live Strava OAuth, a physical iPhone, the offline service-worker shell, and focus return after closing a dialog.
