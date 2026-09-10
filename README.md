# BUILD v0.4

BUILD is a mobile-first marathon build intelligence app.

> Garmin records the run. Strava stores and shares the run. BUILD interprets what the run means for the marathon build.

## Product position
BUILD does not generate a marathon plan and it does not record GPS activities. The runner brings the plan they trust. BUILD matches completed training to that plan, weights sessions by marathon relevance, and turns execution into Build Progress, Forecast, Goal Confidence and simple coaching decisions.

## What works now
- Mobile-first Today, Plan, Progress, Activity and Settings screens
- Guided onboarding around one race goal
- Full 12-week example marathon build
- Session impact model: long run and marathon-specific work carry more influence than easy/supporting runs
- Tap-only post-session assessment: Nailed it / Mostly / Modified / Missed
- Contribution-weighted Build Progress
- Key-session execution score
- Build Forecast with signal suppression until there is enough evidence
- Goal Confidence based on data coverage
- Recent-form and weekly-execution trends
- Coach-style insight that prioritises the next decision instead of guilt/completion streaks
- Activity Inbox
- Strava CSV import from a Strava export
- Proposed activity-to-plan matching using distance, date proximity and activity semantics
- Local browser persistence
- Installable PWA shell and offline caching
- Live Strava OAuth + activity sync backend code for Vercel
- Automated GitHub Actions syntax checks

## Live Strava architecture
The Vercel deployment exposes:
- `/api/strava/connect` — starts OAuth
- `/api/strava/callback` — exchanges the authorization code and stores a sealed HttpOnly session cookie
- `/api/strava/activities` — refreshes tokens when required and returns recent running activities
- `/api/strava/disconnect` — clears the BUILD Strava session

No Strava secret is shipped to the browser.

## Required Vercel environment variables
Create these in the Vercel project settings:

- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `BUILD_SESSION_SECRET` — a long random secret used to encrypt the session cookie

The Strava app authorization callback domain must match the deployed BUILD domain.

## Plan import
The current plan import format is JSON. `sample-plan.json` shows the minimum structure. Planned sessions support week, day, type, title, target, objective and optional distance.

## Current deployment model
- GitHub Pages: working static app, including local assessment and CSV import
- Vercel: intended production web deployment because serverless functions are required for secure Strava OAuth

## Next production milestones
1. Deploy the repository to Vercel and set the three environment variables.
2. Complete one real Strava OAuth flow and validate token refresh.
3. Add persistent user/database storage so a runner can use BUILD across devices.
4. Import richer plan formats and normalise them into BUILD sessions.
5. Expand activity assessment beyond summary distance using Strava laps/streams where permitted.
6. Add automated regression tests around matching and metric calculations.
7. Package the polished PWA as a native iOS app only after the core loop is proven.

## Product rule
Every feature must increase the runner's chance of achieving the marathon goal. If it does not improve a decision during the build, it does not belong in the core product.
