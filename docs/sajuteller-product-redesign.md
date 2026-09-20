# SajuTeller: discovery to a local experience

SajuTeller helps international visitors understand Saju and find a local reader who fits their interests, language, budget, and trip. The marketplace is the core product; educational content builds confidence and routes travelers into it.

## Shipped journeys

| Page | Job | Next action |
| --- | --- | --- |
| Discover `/` | Make Saju approachable through interests, local experiences, and culture | Explore, read a guide, or take the matcher |
| Experiences `/experiences` | Compare studios by topic, language, neighborhood, price, duration | Open a studio |
| For You `/find-my-reading` | Three questions about interest, language, and budget | Filtered experiences |
| Studio `/business/:id` | Understand sessions, communication format, preparation, and price | Preview or request a visit |
| Visit planning `/business/:id/booking` | Choose a session, preferred date/time, language, guests | Save local sample plan or submit real request |
| Learn `/learn` and `/learn/:slug` | Explain Saju, relationships, work, shared experiences, and preparation | Find a relevant experience |
| Saved `/saved` | Shortlist studios on this device | Revisit details |
| Trips `/trips` | Distinguish sample plans from account-linked real requests | Prepare, remove preview, or cancel pending request |
| Become a host `/host` | Explain the partnership and collect a signed-in application | Submit for review |
| Help, FAQ, Account | Answer practical questions and manage session | Resume journey |

## Launch truth

All 60 current active studios are marked `is_mock=true` in the supplied database. These are explicitly labeled Preview studios. Photos are illustrative. Fake reviews and contact fallbacks are not used. No sample booking is sent, charged, or described as confirmed. Sample plans and favorites stay in the current browser.

Real studios can accept authenticated booking requests through `sajuteller_booking_requests`; the request is not a reservation. Database RLS rejects mock/inactive studios, mismatched or inactive services, unsupported languages, excess guests, past Seoul dates, spoofed owners, and arbitrary status selection. Users can read only their own requests and cancel only a requested entry. Operator/host confirmation is an operational next step, not a fabricated automated action.

Host applications are stored in `sajuteller_host_applications`, owner-scoped by RLS, with status submitted. An application does not automatically publish a listing. No payment integration was added; legacy simulated payment routes now open the honest planning flow.

## Design and motion

Mobile first: 16px side margins at small widths, stacked forms and cards, horizontally scrollable interests/experience rails, 44–48px controls, 16px form inputs, safe-area-aware navigation, and a fixed primary action on studio detail. Desktop expands to multi-column layouts. Brand name is SajuTeller throughout the active UI.

The animated starfield is visible in the home hero behind “A little Seoul. A little soul.” It retains scroll-driven depth and a pause control, with reduced-motion support. It is decorative and does not intercept input. Educational and booking content uses quieter surfaces for reading.

The code's semantic colors and type styles are the source for the new editable Figma product page. Legacy design pages remain for history.

## Priorities after this release

1. Onboard and verify real partner studios, language capabilities, photos, pricing, contact details, and cancellation terms. Replace samples with publishable inventory.
2. Give hosts an authenticated operational portal: request inbox, accept/decline, availability, blackout dates, service management, and language support. Until then, authorized operators must review requests and applications.
3. Add transactional confirmations/reminders and accountable support ownership; do not claim they are sent until configured and tested.
4. Introduce payments only with confirmed inventory, cancellation/refund terms, receipts, and real provider webhooks.
5. Collect reviews only after attended experiences. Add maps/itineraries, multilingual editorial content, and shareable reading souvenirs after the core trip works.

North-star measure: attended experiences with international travelers. Track learning-to-listing clicks, matcher completion, zero-result searches, detail-to-request conversion, host response time, acceptance, attendance, cancellations, and language satisfaction. Analytics instrumentation is not part of this change.

## Validation

- TypeScript and production Vite build pass.
- Focused ESLint check passes for new product routes/components.
- Behavioral checks cover combined filters, empty matches, search, non-mutating sorting, local sign-in return paths, and Seoul date formatting.
- Live public database reads verified for active studios and nested language/image records.
- New table RLS and column grants verified: no anonymous reads, no owner/status selection on insert.
- Browser production verification and Figma review recorded in the PR/release follow-up.
- Actual phone viewport emulation is not available in this browser environment; responsive CSS and native 390px Figma layouts are reviewed, but a physical-device pass remains required before a commercial launch.

## Research references

- Oracle Saju: https://www.oraclesaju.com/ — approachable topic-led content and compact mobile navigation.
- Airbnb Experiences: https://www.airbnb.com/experiences — traveler intent, experience discovery, host participation.
- Visit Korea: https://english.visitkorea.or.kr/svc/sp/HallyuNew/contentsView.do?dataSetId=76&vcontsId=216894 — Saju as a cultural visitor experience and multilingual services.
- Visit Seoul: https://english.visitseoul.net/tours/unique-activities-for-a-memorable-seoul-trip_/23395 — local fortune-telling experiences for tourists.

## Release verification, 20 September 2026

The main redesign is deployed through PR #4. Public-browser checks passed for the rebranded home, loaded catalog, star pause/play, all three matcher steps, matched results (love + English + up to ₩80,000), saved studios, detail/service data, preview form submission, Trips, and removing the temporary test plan and favorite. No real booking, payment, application, or message was sent during testing.

Review corrections add a graceful card-photo fallback, clearly illustrative sample location text, contact links for real studios, sign-up return-path preservation and email-confirmation messaging, and remove the unconfigured Apple sign-in action.

Editable Figma handoff: https://www.figma.com/design/ueJ1FlZRj7yJifKruOQWxM/K-Saju-Desktop-UX-Redesign?node-id=79-11283

The new “SajuTeller · Mobile product v2” page includes nine 390px key-state compositions, fifteen local reusable components (including imported source icons), thirteen color/layout variables, and five text styles. Text remains editable; Inter and Cormorant Garamond were explicitly verified on every screen. The starfield uses an instance of the existing editable vector component. Full live animation remains in code. Legacy pages are preserved for history. The handoff is a product-state design reference, not an automatic DOM capture or an exhaustive record of every responsive state. Node IDs and component keys are recorded in sajuteller-design-handoff.json.
