# BUILD implementation assessment — 21 October 2026

## Verified baseline and preservation

The current private Sites repository is commit ff8aeecce7a91ccb100921a7758773bc2bbff25f, matching the recovered v0.16.1 handover. No v0.17 source is available here. The 60 app regressions pass. The root suite has 27 passes, two clock-dependent failures, and one skipped historical fixture test. These are fresh results, not inherited release claims.

Keep the classic JavaScript application, original font/photo/icons, `build.*` storage keys, validated backup format, Node and Worker server paths, and owner-private Site identity. Preserve Modified=58 and the existing explicit-miss adjustment. No framework migration is justified before the core flow is reliable. Do not migrate real browser data or change audience implicitly.

## Architecture decisions

The current application is a private, browser-local PWA. OAuth credentials are server-only and sealed in HttpOnly cookies. It has no application accounts, durable training database, cross-device storage, webhook ingestion, lap/stream analysis, or race-time prediction. Those are future work, not current capabilities.

Use small pure modules for import interpretation and observations, keeping domain logic independent of DOM and provider adapters. Share the browser asset manifest between development and packaging. Keep generated Worker output derived from sources. Version cache and application releases together. All mutation workflows must preserve previous state on storage failure.

For commercial multi-user use, add authenticated ownership, a relational training store, private upload storage, and durable jobs. Add stable workout UUIDs alongside legacy session keys, map existing reviews explicitly, and retain plan revisions and calculation versions. Migrate through validated export/import with a preview and rollback; never replace local data merely because an account signs in. Select the hosting/storage system only after provider permissions and identity requirements are established.

## Integration decision

Current published Strava policy conflicts with the requested expanded analytics and durable history. Review https://www.strava.com/legal/api_policy (especially 5.3–5.5 and 6.2) and obtain appropriate permission before enabling expanded production use. Deterministic processing is not an exemption from analytics restrictions. Preserve existing routes; do not configure credentials, invent activity data, or claim live OAuth verification. A future provider adapter must carry source identity, permissions and retention obligations through derived data.

## Staged delivery and acceptance

1. **Reliability:** repair local asset serving/MIME types, deterministic clock tests, existing-activity refresh, save rollback, and real-plan fixture coverage. All existing tests and packaging must pass. A duplicate activity update must retain manual reviews and match identity.
2. **Import trust:** surface classification ambiguities with explicit per-entry choices; retain source types and applied changes through backups. Preserve all 84 entries, all 23 unspecified distances, workout text and JSON metadata. CSV has no top-level race metadata. Never infer a race date. Cancel must leave the existing build unchanged.
3. **Useful reviews and design:** add factual session observations with explicit limits, no inferred intervals or HR trends, and no automatic score. Apply the requested charcoal/dark-red treatment with mobile, keyboard and reduced-motion checks. Preserve existing branded assets.
4. **Durable ownership:** implement authenticated account storage and versioned migration after an integration/hosting decision. Verify two-user isolation, idempotent writes, reload, cross-device recovery, export, deletion, backup restore and failure recovery before claiming public readiness.
5. **Automatic activity lifecycle:** approved OAuth scopes, webhooks, resumable backfill, rate-limit-aware jobs, deletion/revocation handling, stream availability, ambiguous/split activity correction. Live verification requires credentials and an authorised real athlete. Do not promise watch-to-analysis latency before measurement.
6. **Training intelligence:** retain the current execution score while introducing versioned factual training history. Separate observed data, interpretation and forecasts. Evaluate easy/steady/key/rest/race by purpose; do not reward extra volume. Assess fatigue only from available evidence and disclosed heuristics.
7. **Race-time estimates:** separate from the existing Build Forecast. Define input eligibility and recency, compare race-based methods, evaluate on appropriately authorised held-out outcomes, measure interval coverage and error by ability/evidence level, and publish limitations. Show insufficient evidence until eligible; never relabel execution as finish-time probability.
8. **Release:** mobile/desktop and physical iPhone/PWA checks; accessibility, recovery, monitoring, retention, security, migration rollback and load checks. Widgets and native notifications follow a proven core loop and supported platform capabilities.

## Screen and interaction contract

Home has a single primary review/next-workout action, race goal and countdown, execution plus coverage, weekly training, and an honestly gated outlook. Plan preserves prescriptions, distinguishes rest/race and partial distance totals, and allows safe import review. Runs/Review compares planned versus recorded measurements and purpose, keeping interpretation separate from evidence. Progress explains components and supports interactive weekly inspection. Settings owns goals, connection status, plan management and backups; cross-device and account controls must only appear once implemented.

Use near-black/charcoal surfaces, restrained red actions, neutral typography, original font and imagery. Text and focus indicators must remain legible. Status needs words as well as colour. Respect reduced motion and safe areas; no simulated native features.

## External inputs still needed

Confirmed race date (entered in setup), authorised provider permissions/credentials, hosting/identity decision for multi-user persistence, and actual browser backups before any origin migration. Missing v0.17 source must not be reconstructed from historical claims.
