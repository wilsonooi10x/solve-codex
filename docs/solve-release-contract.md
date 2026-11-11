# SOLVE OS acceptance contract and release status

Date: 12 November 2026 (Malaysia). Runtime baseline: `eabc942`.

**Current status: controlled testing only. Not yet signed off for participant rollout.**

The runtime framework is version 2, matching the manual S–O–L–V–E worksheet. This contract is the single acceptance reference. Do not add features, change stage order, rename decisions or change question policy during hardening. Changes must fix a failing acceptance item and include a regression test. Automated passes do not establish real-model quality or production readiness.

## Frozen behaviour

| Area | Required behaviour | Automated evidence |
| --- | --- | --- |
| S — State | Capture an observable gap, business scope and reported impact; synthesise the statement. Recognise ordinary speech, short figures and qualitative observations. A vague judgment needs clarification. Once facts suffice, enter O without asking for a cause or an unnecessary extra example. | `tests/framework-coach.test.js`: generic/invented facts rejected, restaurant and sales-follow-up PDF regressions |
| Uncertain answers | “Not sure”, “don't know”, advice and skip requests receive useful guidance. Repeated unknowns in incomplete S produce an evidence task and safe pause. Unknowns in O can lead to diagnostic options with the cause unverified. Never fill missing facts or force five guessed Whys. | `tests/framework-coach.test.js`: advice, pause and diagnostic-option regressions |
| O — Observe | Locate leakage; follow supported Why links, up to five. Separate reports, hypotheses and evidence gaps. Do not describe a proposed cause as proven. | Observe and hypothesis tests in `tests/framework-coach.test.js`; real-model interpretation still needs live evaluation |
| L — List | Invite user options; an explicit advice request can show suggestions immediately. Compare impact, ease and feasibility, each 1–5 with higher better. Changing priority changes weights, not underlying ratings. The user chooses. | Framework, workflow and executive UI suites |
| V — Validate | Experiment → result → decision and reason. A saved test plan is a valid workshop finish; never require real-world results during the event. Capture observed results verbatim for user confirmation. Advice and forecasts are not actual results. Allow corrections. | V edit/result guards and `tests/solve-journey.test.js` |
| Decisions | Adopt and Scale enter E at tested versus expanded scope. Improve revises a test while preserving prior evidence. Stop saves learning and offers alternatives. Choosing an alternative preserves the previous cycle. | Framework and executive UI decision/revision tests |
| E — Execute & Evolve | Capture what/how/who/when, business target, meaningful metric/target/method and review date. Use date inputs. Confirmation saves the plan, gives a visible finish and offers an action brief. Do not continue setup questioning or mark the business problem solved. | E confirmation/review tests and `tests/solve-journey.test.js` |
| Memory and providers | Preserve original focus, facts, stage and counters through compact requests, reloads and Claude/OpenAI switches. “Move on” cannot become the problem. User corrections and earlier cycles remain recorded. UI stage and summary must agree. | Long-case, wire-memory, counter and provider-switch regressions |
| AI source and credits | Personal source is explicit and visible. Invalid setup, reload requiring reconnection or provider errors cannot silently spend trial credits. Trial and paid balances remain separate. | Personal-connection and credit-ledger suites |
| Saved work | Account isolation, sync conflicts and offline edits preserve work. Case deletion requires confirmation; current clients honour deletion over stale edits. No other account is changed. | `tests/sync.test.js` |
| Handover | The brief gives practical actions, people, dates, target and measures. Missing assignments remain unassigned. Conversation appendix is optional, and plans are not reported as achieved outcomes. | Case-report suite and `tests/solve-journey.test.js` |
| Manual workshop | Manual stages remain facilitator-controlled, editable and saved. AI stays locked until OS is released. | Workshop and Admin UI suites |

The legacy `frameworkVersion: 1` checkpoint mechanism has different historical question budgets. Its two/three-turn checkpoint policy is **not** the current v2 contract. No fixed question count proves that a root cause is correct.

## Repeatable local gate

Run `npm run verify:release` before proposing a participant release. It runs syntax checks, the full automated suite (including a complete DOM/UI → API journey), and the production build. A failure blocks sign-off. This command is not a Vercel deployment lock or proof that the live site has updated.

The complete journey uses real form-generated request payloads and actual route/framework processing, with mocked provider responses. It covers S → O → L → V → E; an uncertain answer; human option selection; a saved pilot with no invented result; returning with an observed result; owner decision; explicit execution confirmation; and a brief with assignments and dates. Dates, result capture and confirmations must not spend extra AI turns.

## Live acceptance — still required

These items are **not verified** by the local tests or prior mobile tests with mocked providers:

- Verify the deployed Vercel commit and loaded browser assets match the release candidate.
- Run both uploaded problem patterns and a qualitative operations case through the real deployed app on phone and desktop. Include a new case and an already-long saved case.
- Complete real personal-Claude and shared-trial-OpenAI journeys, switching midway through a case. Confirm continuity and usable, non-repetitive coaching. Provider phrasing can differ; the stage contract cannot.
- Say “not sure”, “don't know”, “need your advice” and “skip this question” at appropriate stages. Confirm a practical next step instead of a repeated qualification loop.
- Test both workshop finish states: a test-ready plan with no result, and an execution-ready plan after a genuine reported result and owner decision.
- Exercise Adopt, Improve, Stop and Scale; correct an earlier answer; return to L; reload and resume; confirm the exported brief matches saved assignments and dates.
- Compare account balances before/after real personal and shared requests. An invalid key/provider error must not switch the funding source.
- Rehearse account sync and deletion on two actual devices. Exported PDFs/backups are independent copies and are not erased by case deletion.
- For the previously discussed 200–300 concurrent participants, separately measure deployment/database/provider rate limits, latency, queue behaviour, errors and budget enforcement. That capacity has not been established by unit concurrency tests.

No live API secrets or deployment access are configured in this execution environment, so real-provider/deployed-app sign-off cannot be claimed here. Never paste keys into reports or chat. Use the existing personal connection UI or approved server secret settings for live checks.

## Stop-release conditions

Any answered question looping without a useful next step; S/O progressing on invented facts; lost/corrupted focus; disagreement between the displayed stage and summary; an actual result invented from advice/forecast; confirmation with no saved finish; lost work; or use of the wrong credit source is a release blocker. Record the case, stage, expected/actual behaviour and release commit, then add a regression before fixing it. User reports remain evidence, not a request to add another competing workflow.
