# Executive decision guidance

The objective is a useful decision process for entrepreneurs and heads of department, with fewer peripheral questions and clear separation between evidence, hypotheses and proposed action. The provider receives “Think sharper. Think smarter. Make it greater.” as a reasoning directive: preserve the business goal, distinguish symptoms from causes, consider competing explanations, and recommend the smallest discriminating check rather than claiming certainty. The same contract applies to OpenAI and Claude. Models and their prices are unchanged.

## Conversation behaviour

- The main conversation shows **Business decision in focus**, a **Recommended way forward**, possible causes labelled unverified, proposed next actions, and expandable reported facts/evidence gaps. The recommendation is visible alongside the question rather than buried only in history.
- Default diagnostic budgets are two successful user turns in State and three in Observe. A clear unknown, “you may suggest”, frustration with repeated questions, or a substantially repeated question can offer a checkpoint sooner. These limits trigger synthesis, not a forced conclusion. If the existing stage is already sufficiently captured, the previous normal progression remains possible.
- At a checkpoint, the user sees the working brief and explicitly confirms moving State → Observe or Observe → List. They can instead add/correct important context. No paid AI request is needed to confirm the already-generated brief. Unknown impact, bottlenecks or causes remain labelled as evidence gaps. A cause not yet established is not relabelled as proven simply to advance the stage.
- The AI is instructed to propose a concrete draft/recommendation immediately when asked to suggest, rather than repeatedly asking permission. It should not make testimonial wording, preferred tone or cosmetic details prerequisites to a strategic decision. It must not fabricate client evidence, numbers, results, assignments or deadlines.
- Observe root updates carry a working-hypothesis label. Options should address competing causes or collect decision-relevant evidence, particularly before a consequential staffing/investment decision. Validation and execution require their existing user-confirmed plan/results/decision gates.

## Decision memory and records

New cases anchor the opening problem. Existing cases recover the first stored user explanation, avoiding later tactical drift in a corrupted statement. The explicit **Edit decision focus** form is the route for an intentional change; it preserves the original objective and adds an acknowledgement record. AI responses cannot silently overwrite an existing title or problem statement.

The saved executive context includes bounded user-reported excerpts, stage-turn counts, recommendation, possible causes, evidence gaps and proposed actions. New AI-selected fact excerpts must exactly match the latest user message to enter memory. Earlier facts remain user reports, not independently verified evidence; a model can still misinterpret them. The oldest anchor facts and recent updates are retained within a small bounded context, separate from the rolling recent history. Full messages, original fields, pilot history and audit records remain stored. Legacy cases recover early user reports, including targets that have fallen out of the recent conversation window. The bounded memory is a summary aid, not an unlimited verbatim retrieval system; users can edit/correct the focus and worksheet.

Checkpoint confirmations retain stage, goal, hypotheses and evidence gaps in `executiveReviews`. PDF/PIC reports prioritise the decision focus, show working recommendation/gaps, and keep proposed evidence actions explicitly unassigned and without dates until agreed. Full exports include executive context and review acknowledgements.

## Validation and rollout

Regression checks cover budget-triggered checkpoints, unknown answers, duplicate operational questions, immutable decision focus, recovery of old target facts, provider prompt parity, human confirmation across reload, hypothesis labelling, PDF context, and continued actual-result/owner-decision gates. Mocked provider tests exercise the application controls; they do not establish the quality of real-model diagnosis. Rehearse representative cases with the organiser's selected supported model before the event. No real provider evaluation or 200–300 participant load test is implied by these checks.

No additional SQL, environment variable or Stripe setting is required. Existing cases and manual Workshop mode remain available. Live Stripe payments remain unsupported, independently of this guidance change.

### Advice requests and missing evidence

Framework v2 recognises “not sure”, “don't know”, “need your advice/advise” and similar requests in shared browser/server logic. In State it helps the user identify a real observation; if the user still cannot supply one after several turns, it gives a concrete evidence task and a place to pause instead of inventing specifics. Complete State evidence still progresses normally. In Observe, an explicit unknown can lead to diagnostic options with the cause clearly unverified, even if the model omits its fields. In Validate, an advice request or forecast is never saved as an actual result. Missing people, dates and targets remain uncommitted until supplied or confirmed by the user.

Case deletion requires confirmation in the case list or conversation. Cloud sync replaces the case content with an ID/deletion-time marker, removes it from connected clients, and resolves stale edits in favour of deletion. Offline deletion remains queued for sync. This is app-level deletion, not removal of previously downloaded PDFs, device backups or provider records.

### Personal API source selection

AI Connection confirms the chosen provider in the dialog and header. Known Claude/OpenAI key prefixes are detected; copied environment-variable wrappers, surrounding quotes and invisible copy characters are normalised before validation. Validation failure leaves personal setup pending: AI requests fail locally rather than using credits. Provider errors also retain personal selection without a credit-ledger fallback. The key remains only in tab memory. Non-secret source/provider preferences in sessionStorage preserve personal intent across reloads and account changes, which require reconnecting the key or explicitly selecting 10XSC credits. Selecting a source does not make a paid test request or assert that provider credentials/billing have been verified.

### Switching AI providers within a case

Personal-provider and 10XSC-credit turns use the same framework processor. The processor must consume `context.executive` because the wire-format `problem` deliberately omits executive memory. Preserve original focus, user reports and stage counters across this boundary. Full saved history repairs a corrupted focus such as “Move on” and undercounted turns. Missed targets (including short reports such as “2 mil”), failed follow-ups and explicitly absent SOPs are observations; a vague judgment, duration alone or alleged knowledge gap is insufficient. State summaries describe the server-accepted progression, not a provider's premature assertion that a stage has changed or a cause is confirmed.
