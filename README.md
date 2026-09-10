# BUILD MVP v0.2

A mobile-first progressive web app prototype for BUILD.

## What works
- Mobile Today / Plan / Progress / Settings screens
- Weighted session impact model (long run > marathon pace > threshold > intervals > easy/supporting work)
- Tap-only post-session assessment
- Build Progress rollup
- Build Forecast + confidence suppression until enough sessions are assessed
- Coaching insight based on latest key-session execution
- JSON plan import
- Local persistence with localStorage
- Installable PWA shell + offline cache
- Strava connection represented as demo state only

## Run
Any static server works. For example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Plan JSON
Use `sample-plan.json` as the import format.

## Not yet production-ready
- Real Strava OAuth / webhook sync
- Secure backend/database and user authentication
- Automated matching of imported Strava activities to planned sessions
- Full Technical Pack formulas / immutable metric snapshots
- Native iOS wrapper / App Store packaging

## Product rule
Garmin records the run. Strava stores and shares the run. BUILD interprets what the run means for the marathon build.
