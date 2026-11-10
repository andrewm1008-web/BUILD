# BUILD iPhone web preview · v0.17.0-preview

Interactive browser preview of the native SwiftUI design. It is not Apple's iOS Simulator and does not run SwiftUI. The web rendering approximates the native paper/charcoal palette, serif typography, spacious single-column screens and glass controls.

## Changes

- iPhone display frame on desktop, with 390/430-point display widths, screen shortcuts and light/dark/system controls.
- Full-width app on phones; appearance is also available in Settings.
- Redesigned onboarding, Home, Plan, Review, Progress, Settings and dialogs.
- No photography, decorative images or slogan-style headings. Functional line icons and charts remain.
- Training stays in the existing browser storage. Appearance is a separate preference. Real plan imports, activity matching, reviews and backup workflows are retained.
- Existing Strava connection status stays factual; this preview does not invent runs or successful native synchronisation.
- Reduced-motion and reduced-transparency handling, keyboard focus and opaque glass fallbacks.

## Verification

97 automated checks pass; one optional historical-fixture test remains skipped. Both supplied real-plan formats have always-on import/reload/backup coverage. The production Worker build validates.

Browser inspection covers light/dark mode, all five screens and contained dialogs, with no horizontal phone-content overflow or photographic elements on checked screens. The native SwiftUI project remains separate and unchanged; native compilation still requires Xcode.
