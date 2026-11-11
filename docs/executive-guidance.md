# Executive SOLVE guidance

The objective is a useful, simple decision process for entrepreneurs and heads of department. Preserve the business objective, distinguish symptoms and possible causes, compare useful options, and test before claiming success.

The canonical current behaviour and release gate are in [SOLVE OS acceptance contract](solve-release-contract.md). Framework version 2 follows the manual S–O–L–V–E worksheet. It does **not** use the legacy compulsory two/three-turn checkpoint policy.

## Current conversation

- State turns a general complaint into an observable gap, business scope, reported impact and a concise problem statement. Once sufficient, enter Observe. No requirement to diagnose the cause in State.
- Observe maps leakage and up to five supported Why links. Unknown causes remain unknown or hypothetical and lead to a practical diagnostic check. Do not fill five slots with guesses.
- List invites user ideas or suggests options when asked, compares impact/ease/feasibility, and requires a human choice. Scores are estimates, not proof.
- Validate saves the experiment, people, date, success criterion and measurement. The planning session can finish before real results exist. Later, capture an observed result, confirmation, owner decision and reason.
- Adopt and Scale lead to execution at tested versus expanded scope. Improve revises the pilot; Stop records learning and offers alternatives.
- Execute & Evolve finishes with a confirmed plan, target, metric and review date. Actual progress is reviewed later. A saved plan is not an achieved outcome.

## Memory and uncertainty

Use `context.executive` across the compact request boundary. Preserve the original focus, user reports and stage counters across providers. Recover earlier facts from saved history, repair navigation replies incorrectly saved as the original goal, and never count earlier State answers as Observe turns. Full messages and audit records remain separate from bounded AI context.

Advice/unknown/skip requests trigger guidance. If State still lacks a real observation, offer an example or evidence task and a safe pause, without inventing specifics. In Observe an unknown can lead directly to diagnostic options with an unverified cause. In Validate advice and forecasts cannot become actual results. People, dates and targets remain uncommitted until supplied or confirmed.

State summaries describe the server-accepted progression, not a model's premature announcement of a stage change or a proven cause. Scores, hypotheses and plans remain distinguishable from actual observations.

## Connections, storage and handover

Personal source selection is visible and confirmed. Invalid setup, reload requiring reconnection and provider errors do not silently fall back to trial credits. Keys stay in tab memory; only non-secret source/provider preference is stored for that tab. The provider verifies credentials/billing on the next AI request.

Case deletion requires confirmation and syncs a content-free ID/deletion-time marker. Current clients resolve stale edits in favour of deletion. Previously downloaded PDFs and backups are independent copies.

PIC briefs prioritise practical actions, people, dates, targets and measurement; missing assignments remain unassigned. Planning completion and realised business impact are separate.

## Validation limits and legacy behaviour

Automated provider tests use mocked responses. They establish application invariants and catch regressions; they do not establish the diagnostic quality of real models, successful production deployment or 200–300-user capacity. The live acceptance items in the release contract remain mandatory.

Explicit `frameworkVersion: 1` cases retain a historical checkpoint interface for compatibility. Its question budgets and checkpoint confirmations must not be presented as the default v2 flow. Live Stripe payments remain unsupported.
