# SOLVE OS

Mobile-first black-and-gold prototype for State → Observe → List → Validate → Execute & Evolve.

## Run

Node.js 24; no package installation required.

```sh
npm start
```

The app listens on port 3000 (override with PORT). `npm run check` checks JavaScript syntax.

Includes problem tracking, owner/PIC assignment fields, 5 Whys, solution scoring, pilot results, decision reasons, repeat-trial history, execution plans, KPIs and an optional business compass.

Data is stored in browser localStorage, initially populated with labelled demo problems. This is a single-device prototype: assignments do not send invitations, owner decisions are not authenticated, and there is no cloud sync, native mobile packaging. Do not use it as a secure multi-user system. Browser storage clearing removes saved data.

Solution scores total impact + ease of effort + feasibility (each 1–5, higher is better). Move to scale requires metric, expected and actual results and rationale. Improve archives the completed trial and clears result/decision fields for the next trial.

## Guided voice and AI

New problems begin with a short spoken or typed account. Speech uses the browser Web Speech API where available (HTTPS, microphone permission, supported browser); unsupported browsers keep typed input. Browser speech services may process audio. AI is requested only after the user clicks Draft. Review drafts before applying and saving. Existing worksheets have a collapsible voice/AI assistant; it populates editable fields only, never actual results or owner decisions.

In Vercel Project Settings → Environment Variables, add for Production:

- `SOLVE_AI_API_KEY`: your OpenAI API key (server only; never enter it in the website).
- `SOLVE_ACCESS_CODE`: a long private code shared with authorised workshop participants. This is a basic cost gate, not individual authentication or rate limiting. Rotate it as needed.
- Optional `SOLVE_AI_MODEL`: defaults to `gpt-4.1-mini`.

Redeploy after setting variables. Participants enter only the workshop access code under AI access. Provider billing and model/web-search access must be enabled. Company extraction uses OpenAI web search and returns quoted sources; inaccessible pages or absent PVMC statements require manual completion. Drafts are suggestions, not validated predictions. No API credentials are stored in browser storage. The workshop access code is kept in sessionStorage for the current tab.

For local AI development, inject those variables into the Node process through your secret manager or shell before `npm start`. Do not commit credentials. `npm test` tests configuration/authentication errors, input rejection and filtering of prohibited result/decision fields with a mocked provider. Live provider behavior requires configured credentials and has not been verified in this environment. No shared database or user accounts have been added.

## Conversational SOLVE workflow

Tell SOLVE is now the main entry point. Each answer is processed by `/api/guide` into stage-specific fields with structured AI output, a short summary and one follow-up question. State and Observe advance automatically when both the model and required-field checks consider the stage complete. Observe should gather evidence before offering a working root cause; hypotheses remain visible for review. The captured record and full worksheet remain available for corrections.

List shows suggested solutions, transparent 1–5 scores and priority choices (balanced, impact, ease). Scores are advisory estimates. The user explicitly selects a solution. Validate collects test, PIC, owner, date, numeric expected result, metric and measurement method conversationally. Confirming the pilot starts the waiting period. Only a numeric result quoted from the latest answer can populate actual results, and actuals are rejected before the pilot starts. An actual and feedback are required before decision buttons appear. Adopt/Improve/Stop/Move to scale require a recorded reason. Improve archives the trial; scaling explicitly opens Execute & Evolve. Execution captures plan, PIC, deadline, target/KPI, measurement method and next review. Neither model output nor a good-looking result can automatically approve scale.

Conversations, drafts, trial history and fields are stored in browser localStorage. Closing and reopening resumes the conversation. Errors retain the typed transcript; retry sends it again without duplicating a successful turn. No account authentication, PIC notification, cloud sync or outcome prediction has been added. The existing Vercel AI environment variables and redeployment instructions above still apply. Offline standalone HTML can show the interface and use manual worksheets but cannot call the AI endpoints; use the deployed URL for AI.

Validation: built-in tests cover stage gates, date formatting, priority ranking, access checks, rejection of invented results and prevention of model-initiated execution. DOM interaction checks with mocked AI covered the conversation through explicit scale, persistence/resume and failure recovery. Live provider quality and real phone speech still require verification after activation.
