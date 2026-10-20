# SOLVE OS

Mobile-first black-and-gold prototype for State → Observe → List → Validate → Execute & Evolve.

## Run

Node.js 24; no package installation required.

```sh
npm start
```

The app listens on port 3000 (override with PORT). `npm run check` checks JavaScript syntax.

Includes problem tracking, owner/PIC assignment fields, 5 Whys, solution scoring, pilot results, decision reasons, repeat-trial history, execution plans, KPIs and an optional business compass.

Data is stored in browser localStorage, initially populated with labelled demo problems. This is a single-device prototype: assignments do not send invitations, owner decisions are not authenticated, and there is no cloud sync, AI extraction or native mobile packaging. Do not use it as a secure multi-user system. Browser storage clearing removes saved data.

Solution scores total impact + ease of effort + feasibility (each 1–5, higher is better). Move to scale requires metric, expected and actual results and rationale. Improve archives the completed trial and clears result/decision fields for the next trial.
