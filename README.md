# BUILD — iPhone web preview · v0.17.0-preview

A private mobile-first marathon plan application. This release continues the verified v0.16.1 source and retains existing browser storage, reviews, matching, scoring and branded assets.

## Interactive iPhone preview

The current interface previews the native iPhone design in a browser. Desktop provides a device frame, 390/430-point display widths, screen shortcuts and light/dark/system appearance. Phones use the full viewport. This does not execute SwiftUI or native Liquid Glass. See [simulator notes](SIMULATOR_NOTES.md). Training storage and workflows remain compatible. Photography and slogan copy have been removed from the interface.

## Previous reliability release

- Shared browser asset allowlist fixes missing preview scripts, styles, photos and fonts without exposing source files.
- Calendar functions consistently use the public date clock, with fixed-time interface tests.
- Re-sync updates existing provider activities while preserving saved reviews, match identity and manually added runs. Absence from a sync page does not imply deletion.
- CSV and JSON imports preserve the supplied 84-session plan and all 23 unspecified distances. Five workout-type ambiguities have explicit, unchecked correction choices; accepted changes retain the source type and reason through backups.
- Session reviews separate recorded measurements, purpose-based interpretation and unavailable evidence. They never award an automatic score.
- Charcoal and dark-red visual treatment, goal pace, partial-distance labels, keyboard focus and reduced-motion support.

See [the assessment and staged plan](IMPLEMENTATION_PLAN.md) for architecture, preservation, external dependencies and remaining commercial-product work.

## Develop and verify

Node 20+ and npm:

```sh
npm ci
npm test
npm --prefix app test
npm run build
npm --prefix app start
```

The local server prints its loopback URL. It serves original assets and the existing Node API handlers. The build emits `app/public/` and a self-contained Worker artifact in `dist/`. `worker/routes.js` is the route source; `worker/index.js` is generated.

The optional `npm --prefix app run test:browser` requires Playwright and Chromium installed in `app/`. It uses an isolated browser context and temporary loopback port. It is separate from the Node/DOM suites. The historical optional `BUILD_IMPORT_TEST_FILE` test still requires its exact missing coaching fixture; the supplied real plan has independent always-on coverage.

## Data and integration limits

Training is stored in this browser, not an account database. Download a BUILD backup before clearing browser data or moving devices/addresses. OAuth tokens are not included in backups. Do not infer a race date from the supplied plan; enter it in setup or Settings.

The existing Build Forecast estimates plan execution, **not marathon finish time**. Scores, including Modified=58 and explicit-miss adjustments, are unchanged. Factual observations are not a verified interval, fatigue or fitness assessment. Splits/laps/heart-rate streams are not implemented.

Live Strava requires approved usage and server-only `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET` and `BUILD_SESSION_SECRET` (32+ characters), with the correct callback domain. Do not expose secrets in browser code, source, logs or backups. The current provider analytics/storage policy must be resolved before expanding production use. Existing routes and mocked authentication regressions are not proof of live connectivity.

Preserve the existing private Sites project and audience. Do not deploy this source to the older public repository or overwrite the separate older Vercel app without reconciling it first.
