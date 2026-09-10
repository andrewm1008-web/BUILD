# BUILD v0.5.0

BUILD is a mobile-first marathon plan companion. Bring an existing plan, match completed runs, and review how well each session delivered its purpose.

## Working app flows

- Guided onboarding with CSV or JSON plan import, plus a clearly labelled example build.
- Plan import validation and a preview before replacing the current plan. Invalid files leave the current build untouched.
- Today, Plan, Progress, Activity and Settings screens in cream, navy and racing green.
- Calendar-aware weeks and Sunday matching, with manual week selection for undated plans.
- Activity CSV import with explicit distance units, a preview, non-running activity filtering and duplicate detection.
- Manual run entry and optional distance, time, effort and notes in a session review.
- Suggested matches and a full session selector. Matching opens a review; it does not award an automatic score.
- Explicit review saving, editable assessment history and assessment removal to correct a match.
- Contribution-weighted progress with priority for long runs, marathon-specific work, intervals, then threshold and supporting sessions.
- Forecast suppression until there is sufficient evidence. Forecast describes plan execution, not a predicted finish time or probability of a marathon goal.
- Local persistence, validated JSON backup download and restore, and an offline PWA shell with install icons.
- Strava OAuth and activity sync server routes, including pagination, token refresh, disconnect and non-cacheable responses. Live controls appear only when the backend reports it is configured.

## Run locally

Requires Node.js 20 or later. The app itself has no runtime npm dependencies.

```sh
npm start
```

Open `http://127.0.0.1:8765`. Local plan/CSV/manual workflows work without accounts or API keys. Live OAuth requires an HTTPS deployment and the environment variables below.

## Plan import

Use `sample-plan.csv` or `sample-plan.json` as a template. CSV requires Week, Day and Title. Optional columns include Type, Target, Distance Km and Objective. Supported types are long, marathon, interval, threshold, easy, recovery, strength and cross. Weeks must be whole numbers from 1 to 52. Sessions with the same week, day and title must be unique.

The preview lets the runner set the plan name, race, goal and start date. A new plan clears its assessments and keeps imported activities for rematching. Download a backup to retain a previous build.

## Activity import

CSV supports Activity ID, Activity Name, Activity Type, Activity Date, Distance and Moving Time. Choose the export's distance unit in the preview: kilometres, miles or metres. Moving Time accepts seconds, `m:ss` or `h:mm:ss`. Existing activity IDs are preserved when importing an export again.

## Data and privacy

The plan, activities, profile and assessments live in this browser's local storage. Download a backup before clearing browser data, switching devices or replacing a build. Backups contain training data and notes; they contain no Strava access tokens. Cloud accounts and automatic cross-device sync are not implemented.

## Deployment

GitHub Pages can serve the static files for plan import, CSV/manual activity entry, reviews and backups. It cannot run the Strava server routes.

For a Vercel deployment of this repository, use the Other framework preset with no build command and the repository root as the static output. Configure these server-only environment variables:

- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `BUILD_SESSION_SECRET` — an independent random secret of at least 32 characters

Set the Strava application's authorization callback domain to the deployed BUILD host. `/api/health` reports configuration availability without exposing secrets. OAuth stores tokens in a sealed, Secure, HttpOnly cookie. API routes are excluded from the offline cache.

A real OAuth connection and token-refresh cycle still need validation against the owner's Strava account. No paid services are required for the local app.

## Verification

```sh
npm test
```

The regression suite covers dates, week navigation, volume, forecast suppression, import validation, explicit units, duplicate IDs, backup validation, offline asset coverage, OAuth state and cookies, token encryption, pagination, and API errors.

For the mobile browser flow:

```sh
npm install
npx playwright install chromium
npm run test:browser
```

This checks onboarding, plan preview, failed-import preservation, manual runs, review cancellation and saving, progress, backup download/restore, CSV deduplication, goal editing and offline reload at a 390px mobile width. Screenshots are written to `/tmp` as verification artifacts. This is Chromium mobile emulation, not a physical iPhone/Safari certification.

## Remaining production work

- Connect and verify a real Strava account on the configured HTTPS deployment.
- Add authenticated cloud storage if automatic cross-device continuity is required.
- Analyse laps/streams for structured intervals and marathon-pace blocks; current comparisons use distance, average pace and the runner's review.
- Validate on a physical iPhone before native App Store packaging.
