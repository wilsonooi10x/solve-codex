# Shared SOLVE framework and a clear planning finish

Both the manual workshop and AI-guided modes now use the stage definitions in `workflow.js`: State's problem/current/impact/statement, Observe's process leakage and up to five supported Why links, List's impact/ease/feasibility criteria, Validate's pilot/evidence/decision, and E's execution/KPI/review. Manual fields are sourced from the same module rather than a separate list. The stage objective, steps, expected output and completion rule appear in both UIs. Five Whys is a causal inquiry tool; missing links remain unknown instead of being invented to fill all five boxes.

List uses the same scoring function in both modes. Balanced sums the three criteria; selecting impact, ease or feasibility weights that criterion three times. All scores are 1–5, higher better; ease 5 means least effort. The manual worksheet shows a live comparison matrix and the guided cards allow the user to edit the scores. Estimates and ranking do not automatically choose a solution or prove impact. One selected option and rationale lead into a pilot, tied to the working cause.

## Three milestones

1. **Planning session complete**: a reviewed pilot with what/how, decision owner, PIC, due date, outcome/metric, success criterion and measurement method. Real results remain blank. Participants can finish this within the hackathon and export a short action brief. They may prepare an optional conditional E draft without leaving Validate or asserting that rollout has been approved.
2. **Pilot evidence ready for an owner decision**: after actually testing, the user records expected versus actual and evidence, confirms that the action happened, then decides Adopt at the tested scope, Improve/retest, Stop, or Scale. These are different decisions. An improvement cycle retains previous trial history. The app does not generate evidence for a workshop participant merely to advance a progress bar.
3. **Execution reviewed and cycle closed**: execution at the tested scope (Adopt) or wider rollout (Scale) needs recorded pilot evidence, an owner decision and reason, and a separately confirmed execution plan. E setup finishes explicitly; the next action is to execute and return on a calendar review date. The user then records actual KPI outcomes and learning, confirms the review happened, and chooses adjust/continue or close the cycle. Closing is labelled **Closed**, not an automatic claim of success or proof of causation.

## Workshop and guided behaviour

The guided Validate screen offers a single editable plan form. “Confirm pilot plan & finish planning” saves the plan and hides mandatory chat while keeping optional AI help available. “Confirm plan & start pilot” indicates the test is running. “Record actual result” remains separate. A conditional E draft is stored in `rolloutDraft`, never in actual results or live rollout fields. Saving partial drafts does not make them confirmed commitments.

Manual participants can fill all facilitator-unlocked sections, including conditional E, using their own thinking. Manual E is stored as a conditional draft when approval has not been recorded; the case remains in Validate. “Save planning handover” requires a complete pilot plan and leaves actual results blank. Returning to edit an earlier plan removes its planning-complete marker. The manual mode makes no AI calls. Existing worksheets with legacy E content retain it as an unconfirmed conditional draft rather than silently losing it.

Pilot and rollout commitments are distinct. On owner approval to scale, the pilot plan is retained as `pilotPlan` and in trial history. Conditional draft fields may prefill the E review form, but the user still confirms them. A pilot PIC/date is not automatically reused as a rollout commitment when no E draft exists. E supports one required KPI and up to two optional additional KPIs, consistent with the manual worksheet. Due/review entries must be valid calendar dates. A description such as “monthly review meetings” is retained as an earlier note but does not satisfy the required review date.

The AI cannot populate actual rollout KPI fields. Those come from the user-confirmed outcome review. Confirmed plan fields are not silently overwritten by optional AI chat. Planning, conditional rollout and review drafts save separately under guidance, survive closing/reopening, and do not set actual results. Outcome confirmation checkboxes are never restored as already confirmed.

## Exports

The guided conversation promotes **Action brief PDF (print)**; the manual workshop's PDF button also exports the brief. Full conversation/change-history export remains available from the guided full-record button. The brief includes session status, next action, working recommendation, who/what/when, metrics and any conditional rollout draft marked as not approved. Full exports retain the audit trail. Legacy actual KPI values without a confirmed execution review are labelled unconfirmed. Earlier pilot and later execution outcome records remain separate.

## Rehearsal before the hackathon

Automated tests verify the manual/AI field contract, common matrix scoring, planning without results, conditional draft isolation, evidence/owner decision gates, separate dates and PICs, setup completion, outcome closure, draft persistence and date validation. Browser tests cover these paths on phone/desktop using mocked account/provider services. They do not prove root-cause correctness, real business impact, live model quality or capacity for 200–300 simultaneous participants.

Run a real end-to-end rehearsal with a few entrepreneurs before the event: confirm a plan with no test results, reopen it on a second signed-in device, record a genuine completed test, review the owner decision, confirm E, and record/close an outcome. Evaluate whether each option addresses the working cause and whether the pilot measures a business/behaviour outcome rather than only an activity count (e.g. training videos produced).

No new SQL, Stripe configuration, AI model or payment change is required. Existing saved cases remain available. Live Stripe remains outside this change.

## Clear actions and stage revisions

V shows only the action appropriate to preparation, pilot running, or evidence/decision. Advanced drafting and corrections sit under Other actions. Adopt implements at the tested scope; Scale expands scope. Both open the E form with explicit calendar date inputs. Improve opens a revised pilot form and preserves earlier evidence in trial history; Stop closes the approach and offers alternative options. Confirmed E setup removes repeated confirmation and offers a handover download, close-for-now, and a later outcome review.

The Revisit control separates inspecting saved fields from explicitly starting an earlier-stage revision. Revision snapshots retain the earlier record; actual results and later approvals are invalidated for the revised path rather than reused as proof. Full PDF includes these snapshots. S/O checkpoints review known facts and uncertainties, not a user certification of causal competence. A coaching action challenges the framing and alternative causes using the captured context.

## Simplicity revision

The main V screen now opens one full-width test-plan editor rather than nesting it under duplicate preparation controls. Future-execution drafting is removed from the V user flow (existing saved drafts remain readable in the record/export). Context is collapsed and repeated question banners are hidden for V/E forms. Phone fields stack in a single column. Plan summary layout is explicitly scoped to value rows rather than every direct child div; this prevents form containers being constrained to a 90px column. Plain coaching follows the five stages and keeps uncertainty visible without repeated labels.

## Worksheet-led conversational OS (10 November 2026)

The manual workshop remains facilitator-led. The released OS now uses `frameworkVersion: 2`, shared `frameworkStep` definitions and a dedicated backend coaching contract. Existing unversioned OS cases enter this flow without deleting any captured fields or history. Explicit version-1 records retain their older edit flows for compatibility.

- **S:** problem, specific current gap, business impact and big problem statement. A turn count alone cannot advance a generic complaint.
- **O:** leakage first, then one supported causal Why at a time (up to five), then a possible-root-cause summary. Unsupported links stay empty. No three-answer forced checkpoint. Unknown information becomes an evidence check, not invented causation.
- **L:** invite the user's options before showing estimates. Use the worksheet's balanced Impact + Ease + Feasibility total out of 15; user selects with rationale. AI suggestions are available when needed.
- **V:** conversational experiment design, expected result, measurement, PIC/decision owner and date; confirm the short test summary. Pause until a real result exists. Actual-result confirmation precedes Adopt/Improve/Scale/Stop and reason. No mandatory multi-field setup form.
- **E:** ask for missing What/Who/When/How, business target, one KPI/target/method and review date. Confirm the plan, export the handover and finish the session. Outcome review remains available later.

Dates use one calendar field and save without a paid model request. Volunteered facts can populate several fields in the current stage, so the coach does not ask them again. Full worksheet and history remain accessible. Revisions invalidate later approvals. New backend tests cover generic S, one-link capture, evidence gaps, options invitation, real-result confirmation and the dedicated prompt; a mocked Chromium rehearsal covers the complete S–O–L–V–E path on phone and desktop. No live model quality or participant load claim is implied by those tests.

## Validation correction and reported-result fix

V now offers **Edit test details** at each substep: correct one field, starting with decision maker, without losing other answers. Corrections are retained; changing test/metric/criterion invalidates confirmation of that result. A non-question/non-forecast answer to the actual-result question is saved verbatim as an unconfirmed user report without depending on model extraction. Confirmation and optional evidence/learning precede the explicit owner decision. A direct editor can recover a recent V answer as a draft; nothing from history is automatically confirmed. The API also retains a valid exact user quote rather than dropping it because the model paraphrased the actual field. Exports label unconfirmed reports.

## Grounded State-to-Observe transition

S progression now requires exact user-source quotes for the affected scope, a concrete observable gap/example and business impact, plus a specific assessment. A long AI-written paraphrase or inferred impact cannot satisfy that gate. Generic judgements such as “manager not performing” keep the coach in S and trigger one example question. Concrete qualitative observations count; numbers and dates are not compulsory. A sufficiently detailed first answer can still advance without a fixed minimum question count. Valid quotes persist with the case and travel in bounded context; revising S clears them. Missing quotes prevent generated current-situation/impact details from being accepted as completed S evidence.

## Compare saved alternatives after a completed cycle

The terminal Compare alternative options action now directly returns to List with the saved scores/options, without a hidden revision confirmation or a model call. It marks the previous selection, retains completed outcomes and execution cycles in history, and clears active downstream plans/results/approvals so the next option starts a fresh test. Reopening preserves the comparison screen. If no saved options exist, the UI says so and invites ideas/suggestions. General List revisions also show saved options immediately rather than asking for the same options again.

## Question navigation in V/E

The sticky header uses View question in every active stage. It scrolls to the visible current-question card, measured below the actual header, rather than jumping to the answer input and hiding the prompt. Framework V/E changes (including local date saves and result/plan confirmation) trigger the same question reveal as model replies. Optional answer-focus controls keep their distinct behavior.
