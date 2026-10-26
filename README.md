# SOLVE OS

A mobile-first, black-and-gold problem-solving app: State → Observe → List → Validate → Execute & Evolve.

## Run locally

Node.js 24; no runtime package installation required. Run `npm start` (port 3000, override with PORT). `npm run check` checks JavaScript; `npm ci` installs the locked development test dependency (jsdom); `npm test` runs server, workflow and simulated two-device DOM tests. The connected Vercel project builds static assets into public/ and deploys api/ as serverless functions. Dependencies in lib/ and workflow.js are traced with those functions.

## AI activation in Vercel

In Project Settings → Environment Variables, add these for Production, save and redeploy:

- `ANTHROPIC_API_KEY`: Claude API key, server only. Claude Pro/Max subscriptions do not include API credit.
- `SOLVE_ACCESS_CODE`: a long private workshop password. Participants enter this code under AI access, never an API key. It is a basic cost gate, not a user login or rate limit.
- Optional `SOLVE_CLAUDE_MODEL` (default `claude-sonnet-4-6`).

If no Anthropic key exists, optional OpenAI fallback uses `SOLVE_AI_API_KEY` / `OPENAI_API_KEY`, with `SOLVE_AI_MODEL` defaulting to `gpt-4.1-mini`. Never commit API credentials. The selected provider receives submitted transcripts and problem/business context. Website extraction reads the submitted public HTTPS page and up to two relevant company pages, then sends readable text to the selected provider for structured analysis. It requires source review. Missing statements should stay blank. Predictions are not guaranteed.

Speech uses the browser Web Speech API where available, requiring HTTPS and microphone permission; unsupported browsers retain typed input. The browser's speech provider may process audio. Participants review transcripts and press Continue to submit them to AI.

## Activate cross-device personal sync

Until configured, the app continues to store work on each device. No database is provisioned by deploying this repository.

1. Create a project at https://supabase.com/dashboard using a database password saved in your password manager. Do not put that password in the app.
2. Open SQL Editor → New query, paste the complete contents of `supabase/setup.sql`, and run it. It creates solve_records, per-user row-level security and revision checks. Running it again is supported.
3. In Authentication → Providers, enable Email/password sign-in. Keep email confirmation enabled. In Authentication → URL Configuration, set Site URL to your deployed app URL (https://solve-codex.vercel.app). Supabase's default email sender has restrictions; configure custom SMTP for participants who aren't permitted recipients and for workshop-scale email delivery.
4. Copy the project HTTPS URL and **publishable key** (or legacy **anon key**) from the project's Connect dialog / API settings. Add to Vercel Production environment variables:
   - `SUPABASE_URL`: project HTTPS URL.
   - `SUPABASE_ANON_KEY`: public publishable/anon key. This is intentionally public; access is enforced by RLS. **Never use a secret/service-role key.** The app rejects recognised privileged keys.
5. Redeploy the latest Vercel version.
6. On the phone holding your latest work, refresh without clearing browser data. Click **Sign in to sync**, create an account, confirm the email if required, and sign in. Review **Bring this device's earlier work into your account**, select the intended Validate-stage record and click **Upload selected records**. Wait for Saved in cloud.
7. On the laptop, sign in with the exact same email and password. It loads the cloud records. Do not upload the stale State-stage record unless you want a separate copy. Close open worksheets, then use Sync now if necessary.
8. Verify a small edit on one device appears on the other. Signed-in devices poll about every 15 seconds and on focus. This is periodic sync, not WebSocket realtime.

If activation fails, the account panel reports the error and retains pending local edits. User accounts are separate from the workshop AI code. Supabase configuration and schema must be tested live before claiming cloud sync is operational.

## Storage, migration and conflicts

Device work is backed up before sign-in. Guest work and account caches are kept separate. Earlier records are uploaded only when explicitly selected, not automatically merged. Unchanged demo records are omitted from migration choices. A differing imported record with the same ID becomes a separate copy; neither version silently replaces the other. Existing business compass conflicts are preserved for review/export.

Signed-in edits and conversation drafts queue automatically for cloud sync. Each update matches its last known database revision; a stale revision raises a conflict rather than overwriting a newer record. The user can keep both problem versions or explicitly use the cloud version. Business conflicts can be downloaded before choosing cloud. Incoming changes wait while editing dialogs are open to avoid replacing text being entered. Offline changes remain in the account cache and retry on reconnect; download a JSON backup from the account panel before clearing browser data.

Accounts currently provide **personal sync only**. No shared team workspace, invitations, enforced owner/PIC roles, notification delivery or administrative audit trail has been implemented. The SQL policies isolate rows by auth.uid(); the workshop code does not grant database access. Auth sessions use browser localStorage, as do offline records and drafts. Sign out on shared devices. Offline copies are not remote backups until a successful sync.

## Guided workflow

Tell SOLVE presents one question at a time and maps replies into the worksheet. State and Observe advance when model readiness and required-field checks agree. Observations should support the working root cause. List shows suggested solutions, advisory scores and a priority selector; the user chooses the pilot. Validate gathers how, PIC, owner, due date, metric, expected result and measurement method. User confirmation starts the pilot; actual results cannot be populated before that and must quote a numeric result from the user's latest answer. Result and feedback unlock explicit Adopt/Improve/Stop/Move to scale decisions with a reason. Improve archives the trial; only explicit scale opens Execute & Evolve. Execution captures plan, responsibilities, targets, KPI measurement and a next review. Users can inspect/correct the full worksheet.

## Validation status

Server tests cover AI access/input gates, rejected invented results, workflow progression, Claude structured calls, safe provider errors, and rejection of privileged Supabase keys. DOM checks with simulated providers and two simulated devices exercised sign-in, explicit phone migration, laptop loading, conflict copies, remote updates, account isolation, offline pending edits and conflict preservation. These mocks do not prove deployed RLS, email delivery or a live database connection. Live Claude and physical-device speech also require configured credentials and verification.

The standalone solve-os-preview.html is a downloadable interface preview. Manual worksheets work locally; cloud and AI endpoints require the deployed website.

Validation recovery: decision options are always visible with missing requirements. Record result & decide supports completed actions, including qualitative success criteria, without requiring historical PIC/due-date entry. The user must attest that the action took place and record expected versus actual outcomes before decisions unlock. Measured results accept single numbers, numbers with units and multiple metrics; mixed results retain their original text without an invalid aggregate difference. Qualitative mode also accepts observed outcomes. In-progress result forms save drafts so closing the form does not lose typed entries. Both retain an explicit decision and reason before scaling.

## Home-screen icon

The web manifest declares S.O.L.V.E OS with standalone display and 192/512px Android icons; iPhone uses the 180px apple-touch-icon. On iPhone, open the deployed URL in Safari → Share → Add to Home Screen (enable Open as Web App if offered). On Android, use Chrome → menu → Install app / Add to Home screen. Replace an existing shortcut if its old icon remains cached. Removing a shortcut is not the same as clearing browser/site data; do not clear storage to update an icon. No service worker/offline asset cache is added, so installing the shortcut does not add offline AI or database capabilities.

## Navigation and Business Core 5

Overview → Cases → Business Core 5 are the three navigation tabs. Pilots and experiments are part of their parent case rather than a separate destination. Overview's four summary buttons open the exact category they count; validation can overlap awaiting decision because one is a stage and the other a status. Cases adds stage filters and title/owner/PIC search. Closed/adopted/stopped cases remain accessible under Completed.

Business Core 5 is PVMCP: Purpose, Vision, Mission, Core Values, Positioning. Website extraction reuses the configured AI provider and workshop code. Website content is retrieved directly instead of relying on AI web-search indexing. Each extracted element requires an attributed quote that matches the retrieved page text. Inferred drafts are returned separately as suggestions, shown with distinct labels, and can only be applied by the user. No form or saved business record changes just because an AI response arrives. Applying fills editable fields; saving stores them, provenance labels and sources. If the website cannot be inspected, complete missing elements manually. Quotes are checked against the retrieved or user-provided text; whether a draft faithfully represents the company still needs user review. This feature's provider outputs were tested with mocks; live extraction requires working provider/search access.

Website reading uses public HTTPS only, DNS-pinned IPv4 connections, per-redirect address checks, TLS verification, bounded response sizes and request timeouts. JavaScript-only pages, inaccessible sites and non-HTML documents can still require the Paste company text fallback. Pasted content is explicitly labelled as user-provided. Website analysis now uses structured provider output without requiring paid web-search tool access. The coding environment blocked sushihiro.my, so live extraction from that domain was not verified here. Automated tests cover reading company pages, quote matching, private-address/redirect rejection, access failures and paste recovery. api/assist has a 60-second Vercel function limit; the browser waits up to 60 seconds and leaves existing fields unchanged on failure.

Business Core 5 draft persistence: website analysis, source evidence, editable drafts and pasted text are retained across tab changes and reloads. Analyses arriving after navigation are saved without overwriting confirmed company statements. Applying fills and autosaves a draft; Save Business Core 5 confirms it. Only confirmed top-level PVMCP fields are sent as business context to guided SOLVE; draft and analysis metadata are excluded. Workshop access codes are not included in saved business data. Drafts use device storage and participate in personal cloud sync when configured and signed in.

Business Core save completeness: both Save all available PVMCP and the regular Save Business Core 5 action preserve all available elements. Regular Save fills empty, unedited fields from the retained analysis for the same website, preserving existing values and intentional edits. The website-statements-only advanced action excludes suggestions. Available/confirmed counts show partial results explicitly. Tests cover all five extracted fields, one extracted plus four suggestions, existing Positioning preservation, tab changes and reload.

## Case PDF downloads

Open a case → Download case PDF, or use Cases → Download this case list as PDF to export the current filtered/search results together. The PDF includes the worksheet, owner/PIC/dates, proposed solutions, expected versus actual results, archived trials and decisions, execution targets/KPIs, available change log, the entire stored conversation (including follow-up questions), assumptions and clearly labelled unsubmitted drafts. It also includes current confirmed business context, not pending Business Core drafts. Export timestamps use Malaysia time. The report is generated locally with a bundled, licensed jsPDF library, without sending case data to an export server or AI. Browser/device download and Files/share behavior may vary.

Conversation retention no longer trims to 60 messages. New messages receive timestamps/stages, and meaningful case field changes are logged when saved. Already-discarded messages and previously overwritten fields cannot be reconstructed. The PDF includes only what is currently stored; save worksheet edits and sync devices first if needed. Local/cloud storage limits still apply. Exported text is rendered into high-resolution page images to retain the device's multilingual fonts; PDFs are not text-searchable or tagged for screen readers. JSON account backups remain available for a machine-readable copy. No credentials or workshop code are included in the report model.

Validation: report tests cover 120 stored messages, separate follow-up questions, trial history, targets, change logs and draft labels. A mobile Chromium check downloaded a 76-message, multi-page A4 case PDF and a filtered multi-case PDF; pdfinfo confirmed readable documents and a page rendering confirmed Chinese glyphs. Physical-device Save to Files/share behavior still depends on the browser.

## PIC handover layout

Full PDFs now begin with a structured PIC handover brief: context/status, what/how–who–by when–status actions, KPI expected/actual/method tables, and next review. Supporting material is separated into Appendices A–E (worksheet, pilot/decision history, conversation, case changes, current business context). Inside a case, PIC brief PDF (print) downloads only the opening brief, so a PIC need not print the conversation. Typical brief length is one A4 page; long inputs paginate without truncation, with repeated table headers. The next-action table uses recorded execution/pilot details and clearly labelled workflow next steps; it does not invent owners or deadlines or imply scale before a decision. Decision due dates are not inferred from pilot deadlines.

Validation includes model tests for brief-first ordering, assignment/date accuracy, brief-only versus full appendix output, and a real mobile-browser download. A realistic handover rendered on one A4 page; a 130-step action was tested over multiple pages for table continuation.

## First-time company setup

New workspaces must enter a company name and HTTPS website or company page before opening a case. Setup saves the details in Business Core 5 and remembers completion; existing profiles with both details skip the popup. Users can then review or extract PVMCP in Business Core 5. Setup itself does not call AI. Completion is stored locally and participates in configured account sync. Signed-in onboarding waits for the initial cloud profile to load. Guest completion applies to this browser; clearing site storage resets it.

## Guided answer evidence and feedback

Overview opens the conversation with “I have a problem to” and a prominent SOLVE button. The guided dialog keeps its stage header sticky, shows a processing spinner while waiting, and highlights/focuses each new AI question. Reduced-motion preferences are respected.

Attach evidence to any guided answer: up to three PDF, DOCX, XLSX, PPTX, CSV, TXT, PNG, JPEG or WebP files, 2 MB each; PDF/image binary inputs must total at most 2 MB. Word paragraphs, spreadsheet cell values (including shared strings) and PowerPoint slide text are extracted locally using bundled fflate. Embedded Office pictures, charts, formatting and formula recalculation are not read; export relevant pages as PDF or pictures for visual evidence. Extracted text is limited to 20,000 characters per file and 40,000 per answer, with archive expansion limits. Older DOC/XLS/PPT files must be exported to PDF or modern Office formats.

PDFs and images use native Claude/OpenAI multimodal inputs. Evidence is sent only on Continue with the existing workshop access code. Server validation checks types, binary signatures and size bounds. Filenames and extracted Office/text content are saved in the conversation and included in case reports and configured account sync; original binaries remain in dialog memory only and are not retained across page reloads or case switches. Failed requests retain pending files for retry while the dialog remains loaded. Reattach PDF/image originals if needed in a later turn. Pilot actuals still require explicit user-provided results and the owner's decision. Recent AI history is bounded separately from the full stored/exported conversation.

Verification covers provider payloads and server limits with mocked AI responses, plus Chromium checks of Office extraction, file submission, processing/new-question feedback and sticky progress at phone/desktop sizes. Live attachment interpretation requires a working deployed AI provider and was not exercised with paid credentials here.

Guided feedback visibility: working feedback is pinned inside the sticky stage header and repeated on the disabled Continue button. Successful responses keep a ready banner and gold question card until typing or dictation begins. The View button and automatic arrival scroll use the measured header height so wrapped titles and the banner do not cover the question. Errors clear processing and preserve the draft for retry. Browser checks cover these states at 320, 390 and 1440 pixels.


Guided prompts now ask one short question in a paragraph, without numbered subquestions. Existing stored prompts are preserved in history. AI context uses a shared, bounded selector on both client and server: relevant case field excerpts, Business Core 5 and recent turns; it excludes raw audit/change logs, full guidance objects and trial archives. Oversized facts are explicitly marked as excerpts and cannot be copied back as literal excerpt replacements. Full original records and conversation remain in storage and PDF exports. The client times out stalled requests after 60 seconds, retains the answer and shows a pinned error with Retry. Previous conversation is collapsed below the answer area, and the pinned Answer shortcut reveals the input on phones. Regression tests cover oversized existing cases, unchanged saved history and progression, with browser checks using mocked AI responses.
