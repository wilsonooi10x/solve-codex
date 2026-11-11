# IT handover: enable live Stripe purchases in SOLVE OS

Requested by Wilson / 10XSC. This is an implementation brief, not confirmation that live payments are enabled. Keep the agreed S–O–L–V–E framework unchanged; this work concerns billing, entitlements and payment UI only.

## Business outcome

A signed-in user buys a **one-time RM20 package containing 100 SOLVE AI credits**. After verified successful payment, SOLVE automatically adds 100 purchased credits to that user's account, once per purchase. Repeat purchases add another 100. Purchased credits are separate from free trial credits.

One successful guided AI reply or supported Business Core 5 website/pasted-text extraction uses one purchased credit. Failed AI actions return the reserved user credit. Attachments and other analysis are not currently included in shared credits. Personal API selection continues to use the user's provider account without deducting 10XSC credits.

Customer payment → Stripe/10XSC settlement is separate from OpenAI billing. A webhook updates SOLVE's entitlement ledger; it does not buy or transfer OpenAI API credit. 10XSC must maintain its own provider billing and operational budget.

## Expected user experience

Sign in → AI Credits / Buy credits → Buy 100 AI credits — RM20 → Stripe-hosted Checkout → return to SOLVE → show verified updated purchased balance and how to select it for AI use.

If payment verification is still pending, say so and refresh/poll safely; do not falsely announce credits before the webhook succeeds. Cancellation/failed payment adds nothing. Closing the browser after payment must not prevent server-side credit delivery. Provide a payment reference and a support route for a paid order awaiting credits.

## Current implementation: important constraints

The integration currently supports **Sandbox only**. Supplying live keys or filling the Admin “Future Stripe link” field will not enable live purchases. That field is saved configuration, not the authenticated Checkout/entitlement integration.

Prefer extending the existing server-created Checkout Session flow rather than adding a standalone static Payment Link. It already ties each purchase to a verified Supabase user and a server-created order. No publishable Stripe key is needed for this hosted redirect design.

Relevant source:

- `lib/payments.js`: configuration, tester gate, offer, server-created order/Checkout, raw signature verification and fulfilment validation. Explicitly rejects live keys, prices, sessions and events today.
- `api/payments.js`: authenticated purchase/offer endpoint and Admin controls.
- `api/stripe-webhook.js`: signed raw-body webhook handler.
- `supabase/paid-credits.sql`: separate paid orders, wallets, payment flags, request accounting, transactional fulfilment and refund/dispute freeze.
- `payments.js`, `credits.js`, `workshop.js`: purchase, funding-source, balance and Admin wording/UI.
- `lib/credits.js`: shared OpenAI routing and provider-cost accounting. It pins a model; verify that model's current availability/pricing before commercial launch. Paid usage has a separate paid operational pool; the trial per-account USD allowance is not the purchased-credit allowance.
- `docs/stripe-sandbox.md`: current test setup. Its Sandbox restrictions are intentional and must not simply be removed without mode isolation.
- `docs/solve-release-contract.md`: functional release acceptance that remains applicable to the app.

## Implementation requirements

1. **Explicit test/live mode.** Add mode-aware configuration and validation; do not merely disable the Sandbox flag. Production uses live objects and credentials from the same Stripe account. Staging remains Sandbox. Update all key/price/session/event mode checks together and reject mode mismatches. Keep the tester allowlist for Sandbox; live customer eligibility must be a deliberate policy, not an accidental leftover tester gate.

2. **Live product and credentials.** Create a new live one-time MYR20.00 Price for the 100-credit package. Existing Sandbox product/price IDs cannot be used for live purchases. Store the live `STRIPE_SECRET_KEY`, live `STRIPE_PRICE_ID` and live endpoint `STRIPE_WEBHOOK_SECRET` only in server-side Production settings. Use a fixed production `SOLVE_APP_URL`. Introduce/document any new mode flag explicitly; there is no working live-mode flag today. Do not put Stripe or OpenAI secrets in frontend code, URLs, chat or reports.

3. **Account-bound Checkout.** Obtain the recipient from authenticated Supabase identity, not a browser-supplied email/user ID. Create the order and fixed price/quantity server-side; attach order/user/package metadata and a mode-specific idempotency key. Preserve authenticated return/cancel handling. A forwarded Checkout URL must not change which SOLVE account receives the credits.

4. **Verified live webhook.** Create the live endpoint at `https://solve-codex.vercel.app/api/stripe-webhook` (or the final production domain). Configure `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded` and `charge.dispute.created`. Verify signatures on the unmodified raw body using the live endpoint's own signing secret. Retrieve payment details from Stripe and verify mode, paid status, MYR amount, Price, quantity, package, account/order mapping and refund/dispute state. Return HTTP errors for retryable delivery/DB failures. The success redirect alone must never grant credits.

5. **Exactly-once purchased entitlement.** Credit the matching live wallet atomically. Preserve unique order/session/payment-intent constraints and replay safety. A duplicate webhook or browser retry must not add another 100; a new genuine purchase should. Preserve server-only ledger privileges, audit records and account isolation.

6. **Test/live data separation.** Add a reviewed migration or isolated live storage that distinguishes Sandbox orders, requests, settings, payment flags and wallets from real purchases. Sandbox balances must not become real purchased balances. Archive/preserve test history as appropriate; do not reset trial allowances or unrelated saved cases. Current paid tables do not contain an explicit Stripe-mode column, so document the migration and rollback approach rather than silently reusing test entitlements.

7. **Paid service and refund policy.** Confirm tax treatment, package scope, expiry (if any), refunds, disputes and support wording with Wilson before exposing them to customers. Existing checks expect exactly MYR2000 with no added tax/discount; if tax or promotions change the total, update server verification accordingly. Current refund/dispute handling freezes a paid wallet for review; it does not automatically issue a cash refund or implement a complete partial/used-credit policy. Implement the agreed policy, retaining an audit trail.

8. **Operational availability.** Configure a realistic paid OpenAI operating budget, model prices, billing and limits; monitor payment delivery, fulfilment failures, pending paid orders, provider failures and low budget. Do not silently impose the free-trial per-account USD cap on purchases. If paid service cannot be supplied, pause new Checkout and provide an agreed resolution for existing paid customers. Verify provider pricing/model and intended participant capacity; neither Stripe activation nor automated tests establishes 200–300-user readiness.

9. **Customer UI.** In live mode remove Sandbox/test labels and tester-only explanations, clearly state RM20 / 100 AI credits, keep free/purchased/personal sources distinct and make the active source visible. Preserve existing SOLVE stage behaviour and personal-key protections.

## Acceptance before enabling public purchases

Provide Wilson with the deployed commit, configuration/migration checklist (no secret values), test results and a rollback/pause procedure. Confirm:

- Test success/cancellation/decline, delayed delivery and duplicate/replayed webhooks in Sandbox first.
- Complete an agreed real RM20 live purchase and refund rehearsal after authorisation; Sandbox cards are not live cards.
- Successful live purchase adds exactly 100 credits to the correct signed-in account. A second account receives none; an existing Sandbox balance is not carried over as purchased value.
- Replay the real completion webhook: zero extra credits. Repeat an actual purchase: another 100.
- Cancelled, failed, unpaid and forged/mode-mismatched events add no credits.
- Payment succeeds but webhook is delayed / browser is closed: credits eventually appear once; support can reconcile the order safely.
- A successful paid guided reply changes 100 → 99. A failed action restores the user credit; retry/replay cannot double debit. Business Core 5 follows the same agreed credit scope.
- Free credits remain unchanged during paid usage; personal API usage does not spend either pool.
- Refund/dispute handling matches the agreed policy, including partly used purchases.
- Existing saved cases, Admin, manual workshop and S–O–L–V–E acceptance checks still pass.

Keep live purchases disabled until payment/entitlement acceptance and the app's functional release acceptance are signed off. Preparing this integration does not itself sign off SOLVE OS for participant rollout.
