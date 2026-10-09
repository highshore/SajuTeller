# Saju Journey implementation — October 9, 2026

Source: https://www.figma.com/design/XX5GR59paoSmtPWHFbS2yT?node-id=2-2

This first implementation establishes the Figma visual system and the core discovery/account journey. The existing React, Vite, React Router, styled-components, Heroicons, and Supabase stack is retained.

## Implemented

- Figma canvas/surface/elevated/plum/gold tokens, bundled Inter and Cormorant Garamond fonts, and original unmodified Figma illustrations.
- Explore home (8:2), intention search (8:66), reading result cards (8:105), reading detail (8:189), map layout (8:158), Studio entry (19:103), and profile (10:2).
- Responsive desktop and mobile adaptations. Studio photos, reader identities, prices, languages, counts, and reviews come from the existing database rather than design examples.
- Roundy-inspired shared shell: sticky desktop GNB, one navigation definition shared with the four-tab mobile dock, compact policy footer, safe-area spacing, and the same shell on sign-in/signup pages.
- Centered 440px method-first auth flow with email sign-in, signup, email confirmation, password visibility, reset request/update, policy links/acceptance, safe return destinations, and onboarding.
- Profile editor for display name, preferred reading language, optional birth date/time/place/time zone, and birth-detail removal. The save operation is atomic and constrained by owner RLS.
- Database policy acceptance, column-level profile permissions, and an invoker-rights profile RPC. Users cannot change their own role or authentication identity.
- Existing preview booking, save-reading, and booking-request paths remain functional. All 60 current studios are marked as sample data. No real payment is collected or promised.
- Map now consumes `saju_studios` and offers selectable locations with an OpenStreetMap embed, instead of querying obsolete marketplace models.

## Intentional scope for this first PR

The Figma file also contains payment/checkout, confirmed-booking detail, live interpretation/transcripts, partner administration, and generated Connection/Daily Flow/Name result screens. Those complete screen redesigns are not part of this first PR. Existing AI routes remain linked from the Studio. Connection currently links to compatibility readers. Payment processing, genuine live availability/instant-booking, and new AI generation were not introduced.

Production facts replace illustrative Figma claims: preview studios do not display fabricated verified-review counts, guaranteed availability, or blanket refund promises. The profile readiness label does not imply identity verification. Only configured Supabase login providers are displayed.

## Supabase

Project: `jbwuefecydjkieplftia`.

Applied migrations are committed with matching remote versions:

- `20261009071213_saju_journey_consents.sql`
- `20261009071245_saju_journey_profile_permissions.sql`
- `20261009071503_saju_journey_save_profile.sql`
- `20261009071706_saju_journey_legacy_api_security.sql`

The final migration fixes the existing legacy `locations` view to honor caller RLS and removes public execution of an internal event-trigger function. Security advisors returned no findings after these changes.

`profiles.auth_user_id` links to Auth; it is not the same as `profiles.id`. Birth profiles reference `profiles.id`. The auth-created profile trigger remains the source of profile creation.

`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are preferred. `VITE_SUPABASE_ANON_KEY` remains supported for existing deployments. Secret/service-role keys must never be used in Vite client variables.

Email signup is enabled and email confirmation is required. Google, Kakao, Apple, and phone providers are disabled in the project as inspected on October 9. No provider credentials or Auth redirect settings were changed. The deployed site's origin must be allowed for `/auth-callback` in Supabase Auth URL Configuration. Verification-email delivery and third-party OAuth were not exercised.

## Validation

- `npm run build`: TypeScript + Vite production build.
- ESLint on touched application code.
- `scripts/visual-check.mjs`: live Supabase read data, mobile/desktop shell and geometry, district search, saved state, reader detail, preview booking/removal, signup validation, password visibility, protected profile route, map, policy routes.
- `scripts/verify-profile.sql`: real database test in a transaction that rolls back every synthetic row. Checks atomic profile saving, consent, cross-user isolation, denied role escalation, invalid time zone, and removing optional birth data.
- Supabase security advisors: zero findings.

The repository's older migration history does not match the full remote schema; do not reset the database or blindly replay all historical files. These four migrations are already applied to the supplied project.

## Mobile app layout correction — October 10, 2026 (KST)

Roundy's current consumer shell uses a 430px maximum width at every browser size. SajuTeller now follows that same model: full width on phones and a centered mobile app column on larger screens. The admin route keeps its independent wide layout.

Responsive rules on active consumer screens query the `saju` container instead of the browser viewport. This keeps mobile typography, single-column cards/forms, signup, compact header/footer, and the bottom dock consistent on desktop. The fixed booking action and bottom navigation share the app's width and center line, with safe-area spacing. The map height follows the available viewport height, and saved-reading buttons have 44px touch targets.

The visual check script covers 320, 390, 430, 768, and 1440px browser widths. It verifies the app width, aligned header/dock/booking action, no horizontal page overflow, and the same mobile hero geometry across screen sizes, alongside the existing interaction checks.

## Roundy sign-in experience — October 10, 2026 (KST)

Authentication now follows Roundy's current method picker, back navigation, brand/heading hierarchy, 56px outlined provider buttons, form spacing, inline sign-in/signup/reset transitions, policy review dialog, and email confirmation screen. SajuTeller's purple surfaces and gold primary actions replace Roundy's colors. Existing global navigation and the 430px app shell remain in place.

Five unmodified Google Noto Lottie animations are served locally and loaded on demand. Each plays once (under four seconds); reduced-motion users see a still frame. Attribution and the CC BY 4.0 source links are in `public/emoji/NOTICE.txt`, linked from the footer details.

Only configured, supported providers appear. The project currently supports email; disabled Kakao/Google methods are not presented as working options. Username and phone authentication were not added. Existing account onboarding remains responsible for authenticated, versioned database consent; the pre-signup dialog gates account creation and uses the same policy documents as the public pages.

`scripts/auth-check.mjs` stubs authentication responses, so its signup/reset/resend checks do not create accounts or send emails. It covers method selection, animations, reduced motion, password reveal and validation, signup switching, policy review/cancel/accept, confirmation and resend cooldown, password recovery/update, settings retry, safe sign-in return navigation, and small/large viewport geometry.
