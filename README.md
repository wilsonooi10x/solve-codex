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
