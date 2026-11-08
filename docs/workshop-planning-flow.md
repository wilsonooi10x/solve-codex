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
