# Facilitator-led S.O.L.V.E workshop

## What is implemented

Participants sign in using the existing personal cloud account system. During workshop mode, only the manual worksheet appears. No company website setup or AI tools are offered. The facilitator opens stages cumulatively: State, Observe, List, Validate, Execute & Evolve. Earlier stages stay editable, and later stages stay locked. Participants can type or dictate into each worksheet field, score their own solutions, and download the worksheet PDF. Fields save locally immediately and join the existing account sync queue. Voice uses the browser's speech service; it is transcription rather than SOLVE AI reasoning.

At the end, the facilitator releases OS mode. The usual Overview, Cases and Business Core 5 appear, and workshop worksheets remain in Cases. First-time company setup occurs at that point. A participant can connect a Claude or OpenAI personal API key through AI connection. Keys live in tab memory, are sent only to the same-origin AI endpoints and selected provider, and are cleared on account change. They are not stored in cases, localStorage, sessionStorage or the database. Reloading requires reconnecting the key. The provider bills the participant's own API account. A provider subscription is separate from API billing.

## One-time production setup

1. In the app's Supabase project, run `supabase/setup.sql` (if not already done), then `supabase/workshop.sql` in SQL Editor. The controls table is accessible only to the server's service role. Personal worksheet records still use the existing per-user RLS policies.
2. In Vercel → project → Settings → Environment Variables, configure these for Production:

   | Name | Value |
   | --- | --- |
   | `SUPABASE_URL` | Existing project HTTPS URL |
   | `SUPABASE_ANON_KEY` | Existing public publishable/anon key, for account login and private record sync |
   | `SUPABASE_SERVICE_ROLE_KEY` | Server-only service-role key from this Supabase project; never enter it in the app |
   | `SOLVE_WORKSHOP_ADMIN_CODE` | A randomly generated secret, preferably 32+ characters (minimum 16); share only with facilitators |
   | `SOLVE_WORKSHOP_ENABLED` | `true` to enable global workshop controls |

3. Deploy the latest code. Until `SOLVE_WORKSHOP_ENABLED=true`, the ordinary OS and its legacy workshop AI access code keep their existing behavior. When enabled, the initial database row starts with Workshop / Welcome only. Do not enable before completing the database setup.
4. Click **Workshop** in the normal app header, or open `https://solve-codex.vercel.app/#workshop-admin` privately as facilitator. Enter the admin code. The account password, personal AI key and admin code are separate credentials.
5. Choose Workshop mode and “Welcome only”, then Publish. Participants open the ordinary site URL and sign in/create an account. They do not need an AI key for the workshop.
6. Select “Through S — State” and Publish to begin. Repeat for Observe, List, Validate, Execute & Evolve. Stage updates usually appear within 15–18 seconds (15-second client polling, up to 3 seconds of CDN caching), or when participants return to the tab. Previously entered work is preserved if controls are moved back to an earlier stage.
7. At the end choose “Release S.O.L.V.E OS” and Publish. With global controls enabled, the old shared AI access code does **not** spend the organizer's API credit after release. Participants must use their own key; paid access is not enabled yet.

The controls are shared across **this entire deployment**, not separate event rooms. An admin publish uses a database revision check to prevent one facilitator silently overwriting another's update. Admin access is protected by the secret on the server; hiding controls in the browser is not the security boundary. Both AI endpoints independently check the shared mode and reject AI requests while Workshop is active. If the shared settings cannot be read, AI stays locked. Calls already accepted before a lock change may finish.

## Before 200 participants arrive

- Configure Supabase production email/SMTP and signup limits, or pre-create and verify participant accounts. Supabase's default email service limits are unsuitable for 200 simultaneous confirmations. Test account creation, email confirmation, sign-in and password recovery before sharing the link.
- Check Supabase connection/auth/storage quotas and Vercel function/bandwidth limits for the event. The controls GET is cached briefly at the CDN; worksheet input does not invoke AI. Worksheet account sync is debounced by the existing client and polls every 15 seconds.
- Test with several real accounts on phones and laptops: open State, enter and dictate a note, unlock Observe, return to State, confirm the saved entry on the second device, export PDF, release OS and make a small AI request with a participant key. Test offline/reconnect as well.
- Work is private per participant account. A team collaboration workspace or a facilitator dashboard reading every participant's worksheets is not included. Sharing an account would share its records, so use individual accounts.
- Hosted startup, actual cloud cross-device operation for this new UI, browser speech services and a 200-person production load have **not** been verified by the development environment. Automated tests cover account isolation/sync, mode gating and personal provider selection; browser checks use mocked Supabase/control services.

## Stripe and paid AI access — pending

Stripe purchasing is deliberately disabled. The admin form can retain a future Stripe link, but participants are not asked to pay and a checkout return URL never grants AI access. No payment-derived credits or codes are issued yet.

When the Stripe price/payment details are ready, connect a signed Stripe webhook and a durable entitlement/credit ledger before exposing the payment link. Decide the pack price, included AI allowance and refund/expiry policy. Fulfil purchases idempotently against verified Stripe events and authenticated customer accounts, deduct usage atomically, and keep the organizer's API credentials server-only. Never distribute the organizer's raw API key to customers. That integration requires Stripe setup/credentials and the agreed product details; a link alone is not enough for automatic credit activation.
