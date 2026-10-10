# Business chat and language rollout

The app supports English, Korean, Simplified Mandarin Chinese, Japanese and Spanish. The circular flag in the header opens the language sheet. Preference is kept on this device; reading language in the profile is separate. Studio-provided localized descriptions are used when available, with source text as fallback.

## Kakao KOE205

The sign-in request overrides Kakao's OAuth `scope` with `profile_nickname profile_image`. Supabase's `scopes` option only appends to its defaults; the singular `queryParams.scope` is deliberate and verified against the hosted authorize endpoint.

In Supabase Authentication → Sign In / Providers → Kakao, enable **Allow users without an email**, save, and ensure Kakao consent items for nickname and profile image are enabled. The email scope is deliberately not requested. If KOE205 persists, Kakao's error details identify the remaining unconfigured consent item. Verify a real Kakao account login after these dashboard settings are saved.

## Stream credentials

Use a dedicated SajuTeller Stream application. In Supabase → Edge Functions → Secrets for project `jbwuefecydjkieplftia`, set:

- `STREAM_API_KEY`
- `STREAM_API_SECRET`

The browser gets the public key and a 15-minute token from `business-chat`. Neither the Stream secret nor a Supabase service-role key belongs in Vercel `VITE_*` variables.

With these two Stream values in a trusted local shell environment, run:

```sh
node scripts/configure-stream.mjs
```

This creates/updates the dedicated `saju_business` channel type. Clients can read and send messages only as channel members. Creating channels and changing membership are server-only. Uploads and URL previews are disabled. The function fails closed until the channel type is configured. No external messages are sent by setup.

## Assign business staff

Business staff must be existing Supabase users explicitly assigned by an administrator. They use `/messages` to reply. Customers enter from a real business's detail page; preview businesses never create conversations. Existing sample studios remain previews until their real details and staff have been confirmed.

For staff management, set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STREAM_API_KEY` and `STREAM_API_SECRET` in a trusted server/local environment. Then run:

```sh
node scripts/manage-business-staff.mjs add STUDIO_UUID USER_UUID
node scripts/manage-business-staff.mjs remove STUDIO_UUID USER_UUID
```

These commands synchronize the protected database assignment and existing Stream channel membership. Use the removal command rather than only deleting a database row: Stream must also remove the user from existing conversations. If interrupted, rerun the same command and verify completion before considering access revoked. Never distribute the service-role key to staff clients.

## Backend

Migration `20261009203716_saju_business_chat.sql` creates private staff mappings and conversation records with RLS. Browser clients can read only their own/participating records and cannot write either table. `business-chat` verifies bearer tokens with Supabase Auth, ignores client-supplied user/member IDs, rejects mock or inactive studios, and derives the customer identity from the verified session.

## Verification

- `npm run build`
- `node scripts/auth-check.mjs` (Playwright; optional `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` overrides)
- `node scripts/global-experience-check.mjs` (fixtures; no real users, messages or bookings)
- `node scripts/business-chat-check.mjs` (server authorization and token boundary checks)

Live Kakao consent/login and actual two-account Stream delivery still require provider setup and real test accounts. Local UI checks do not establish those integrations are live.

## Demo studios and short onboarding (October 10)

Three explicitly labeled fictional studios are seeded by `20261010012324_demo_studios_and_chat.sql`: Moon Gate Saju, Seoul Starlight Tarot, and Two Moons Atelier. They stay `is_mock=true` and cannot make real reservations. Only their server-managed `demo_chat_enabled` flag permits demo chat. The other sample studios remain blocked.

**Current credential location: Vercel production → `saju` → Environment Variables.** `STREAM_API_KEY` and `STREAM_API_SECRET` are server-only secrets already configured there. `api/business-chat.ts` runs in Vercel and uses them directly. The Supabase `business-chat` endpoint forwards to this fixed production API, while `business-chat-context` verifies the bearer token with Supabase Auth and derives the user, studio, staff, and private channel ID. No Supabase service-role key is copied to Vercel. Deploy both Supabase functions when updating this integration. The earlier Supabase-secret instructions are not required for this deployment.

The first authenticated request initializes the dedicated `saju_business` channel type if absent, with members-only permissions. Existing unsafe configuration fails closed; `scripts/configure-stream.mjs` remains the administrative repair command.

Demo hosts are synthetic Stream users labeled “Demo host (automated)”. They send a welcome and scripted responses about pricing, languages, locations, availability, and preparation in all five app languages. Replies are generated only after checking the original Stream message belongs to the verified customer and the correct demo channel. Stable reply IDs prevent duplicates on retries. These are demonstrations, not real availability or confirmed appointments.

Onboarding now has three steps: nickname, reading language, and review. Birth details are optional, collapsed by default, and preserved when editing an existing profile. New policy acceptance is collected in the existing review dialog; the existing atomic profile RPC handles persistence.

Validation: `npm run build`, `node scripts/business-chat-check.mjs`, `node scripts/onboarding-check.mjs`, and the existing auth/global browser suites. Browser checks use the `CHROMIUM_PATH` and `PLAYWRIGHT_MODULE` environment variables in this workspace.
