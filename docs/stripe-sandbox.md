# Stripe Sandbox: RM20 / 100 text replies

This version implements **Sandbox only**. It deliberately rejects live keys/events. Test purchases add test replies to a separate paid wallet; they are not a live entitlement. Test AI replies still consume the organiser's real OpenAI API balance. Live payment launch needs separate rollout review, a supported model, refund/consumer terms and a representative cost/load rehearsal.

## Setup in order

1. Deploy this version. In Supabase SQL Editor run the full `/paid-credits.sql` file (also [supabase/paid-credits.sql](../supabase/paid-credits.sql)), after the existing `credits.sql`. It is transactional and rerunnable. It starts disabled, does not reset trial allowances, and adds server-only tables/functions protected by RLS and revoked public privileges.
2. Keep the existing trial settings and verified model prices. Paid replies use the same pinned `gpt-4.1-mini-2025-04-14` and prices, but a separate organiser budget and turn balance. This model is marked deprecated in the organiser's pricing screenshot; replace and validate it before a live event. The trial account USD allowance and trial event USD budget do not limit purchased replies.
3. In the **same Stripe Sandbox** as the product, create a webhook destination for `https://solve-codex.vercel.app/api/stripe-webhook`. In Developers / Workbench → Webhooks (or Event destinations) choose **your account**, a **webhook endpoint**, and these events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `charge.refunded`
   - `charge.dispute.created`
4. Copy the destination's signing secret directly to Vercel, never into chat. Set these Production environment variables (the site runs in Production; Stripe remains in Sandbox):

   | Variable | Value |
   | --- | --- |
   | `STRIPE_SECRET_KEY` | Sandbox `sk_test_…` secret key |
   | `STRIPE_PRICE_ID` | The Sandbox one-time MYR 20.00 `price_…` ID |
   | `STRIPE_WEBHOOK_SECRET` | That destination's `whsec_…` signing secret |
   | `SOLVE_STRIPE_SANDBOX_ENABLED` | `true` |
   | `SOLVE_STRIPE_TESTER_EMAILS` | Comma-separated registered emails for the organiser and trusted testers |
   | `SOLVE_APP_URL` | Optional, fixed HTTPS origin; defaults to `https://solve-codex.vercel.app` |

   Keep `SOLVE_WORKSHOP_ENABLED=true` and existing Supabase/OpenAI keys. Never add secrets to frontend JS or use a `NEXT_PUBLIC_`/`VITE_` prefix. The Stripe secret, price and webhook must all belong to the same Sandbox. No publishable Stripe key is needed: the server redirects to Stripe-hosted Checkout.
5. Redeploy. In `/#workshop-admin`, enter the existing admin code, scroll to **Paid reply testing → Load paid controls**. Select a small **total paid testing API budget** (for example US$1 for a few trusted accounts), enable the checkbox, save. This is an app cost guard using the model rates already saved in trial controls; it is not a Stripe charge, provider credit purchase or universal OpenAI hard cap. Do not enable more than the provider balance you intend to spend. Live launch is not enabled by any of these settings.
6. Ensure workshop mode is **Release S.O.L.V.E OS**, sign in with a named tester account, close any conversation, and click **Credits / Buy replies** in the main header. The Sandbox purchase button appears beneath the trial balance. Other accounts get a disabled button with a tester/configuration explanation. No trial approval is required for purchased replies, but the tester allowlist is required for both checkout and paid AI.
7. Click **Buy 100 AI replies — RM20 (test)**. On Stripe Checkout use `4242 4242 4242 4242`, any future expiry, any 3-digit CVC and test billing details. Never use a real card in Sandbox. Cancelled/declined payments do not grant replies.
8. After returning, click **Refresh balance** if Stripe's webhook has not arrived yet. Only a verified paid Checkout Session grants 100 replies, once per order. A successful return URL by itself grants nothing. Choose **Use purchased replies**, close Credits, and send a text-only guided answer. The button says **Continue · paid reply**. A successful reply changes 100 → 99. Refresh/retry the same successful request must not consume another reply.
9. Re-send the actual checkout completion event from Stripe's destination delivery history; it must return HTTP 200 and must not add a second 100. A generic generated sample event is not enough to fulfil an order: it must match a real server-created test checkout. Check Stripe delivery failures and re-send after fixing configuration; database errors intentionally fail the webhook for retry. Closing the tab doesn't prevent server-side credit delivery.

## Behaviour and review limits

The server verifies Supabase JWTs, obtains owner ID from that identity, checks tester eligibility and workshop release, validates the active one-time price (MYR 2000 minor units), and creates a private database order before requesting Stripe Checkout. The client cannot set price, amount, quantity, entitlement or recipient. A stable checkout UUID and Stripe idempotency key preserve retry safety after interrupted requests. Five new checkout attempts per account per hour are allowed. Old orders require an explicit new purchase attempt. Test cards are the only payment method enabled.

The webhook verifies HMAC-SHA256 over the **unmodified raw body**, with a five-minute timestamp tolerance and constant-time signature comparison. The Node/Vercel webhook disables body parsing; the local server supplies the original bytes. The server retrieves the session and expanded line items/payment intent from Stripe, checks Sandbox mode, amount, currency, payment status, refund/dispute state, quantity, package and account metadata, then atomically fulfils the matching server order. Session and payment-intent uniqueness plus a locked fulfilled order prevent duplicate/replayed grants. Secrets and provider errors are never returned to the browser.

Paid turns are explicitly selected in Credits. Trial usage stays the default. Source selection is tab-local per account; requests include it in their stable browser fingerprint so changing source does not replay another source's result. Paid requests use the same validated guide pipeline, model, 1,800 output-token cap, 25-second timeout, attachment restriction, estimated cost accounting and no automatic retries. Each wallet has one in-flight request and six attempts per minute. SQL transactions reserve the organiser's paid pool and one paid reply before OpenAI. Valid provider usage releases unused reservation; failures refund the reply but possible provider cost is retained against the organiser pool. Unknown usage pauses paid testing. Interrupted requests older than ten minutes return the paid reply once and retain the possible provider cost. Trial and paid pools remain separate, including rate limiting and request IDs.

Refund/dispute events freeze the whole paid wallet for manual review and retain the ledger; they do not automatically cash-refund, delete used replies, or unfreeze other purchases. The latest Stripe charge is checked before granting. Pricing changes, multiple concurrent wallets, model availability, actual provider billing, tax, expiry/consumer terms, live refunds and database backup/retention must be addressed before commercial rollout. The paid budget can pause access while preserving purchased replies; do not promise live uninterrupted service based on this Sandbox rehearsal.

Production migration, webhook creation, environment secrets and the actual Stripe Sandbox payment must be performed in the organiser's dashboards. Development tests use embedded PostgreSQL and mocked Stripe/Auth/OpenAI; no live payment, real card, provider charge or production migration is performed by them.

Business Core 5 website/pasted-text extraction is also included: select **Use purchased replies** in Credits, then extract from the Business Core 5 tab. One usable extraction uses one purchased credit; failed extractions return it. See [trial allowance behaviour](trial-credits.md#business-core-5-extraction) for reservations, evidence review and retries. Live payments remain disabled.
