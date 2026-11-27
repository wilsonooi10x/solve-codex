# State coaching and progression — 27 November 2026

## Corrected failure

The Ecoslink PDF showed a real State loop: a user supplied a 500k-to-400k sales change, period and revenue/target impact, but the deterministic scope gate still required a product, unit or team. The saved company profile had not been included as acceptable company-level context. The unknown fallback then repeated a request for a concrete example already supplied. In addition, a mixed sentence containing an observed change and a future target could be rejected in its entirety by the prediction filter.

## Behaviour

- A short generic trend such as “my sales dropped” receives a relevant example and one clarification. No invented figures or cause.
- Company-level context from the saved profile can satisfy scope. The affected unit/product/team may remain an evidence task in Observe.
- A reported sales/revenue metric change is itself an impact; an extra loss consequence is not compulsory.
- Verbatim observed clauses are retained even when a later clause expresses a forecast or goal. Unsupported totals or currency are not added to the deterministic problem frame.
- After coaching, repeated explicit uncertainty (at least two uncertainty replies and at least three prior State turns) can move a reported concern to a provisional Observe task. The missing observations and impact are explicitly labelled, rather than asserted as facts. A high turn count, generic agreement or fabricated model quote alone cannot advance a vague case.
- “Give an example”, “What else do you need?” and “What do you mean?” are coaching requests.
- Existing cases recover on a new turn using retained facts and profile context. No case deletion or credit reset is required.
- V still requires user-reported/confirmed real results and an owner decision; missing owners/dates are never invented. No payment, budget, model selection or credit-accounting changes are included.

## Verification

The release suite has 145 passing tests, including seven Ecoslink regression tests. Coverage includes generic complaints, supplied metric changes, mixed historical reports/forecasts, retained facts across context compaction, requests for examples, repeated uncertainty, rejected fabricated quotes, and actual browser-generated API payloads updating the saved case from State to Observe. Existing full S/O/L/V/E journey and payment-ledger tests remain green. Provider responses are mocked for repeatability; this does not constitute live-provider or 300-user load validation.
