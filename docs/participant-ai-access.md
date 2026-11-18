# Participant AI access — 18 November 2026

Participants use 10XSC free or purchased credits. Personal API input and source selection are removed. The server rejects personal-key/provider headers; stale tabs cannot override managed funding. Prior source preferences are cleared on load. Server keys and facilitator tests remain private.

English and Chinese remain available in speech selectors; Malay was removed. The opening card is centered with a single primary Start solving action.

## Evidence

Guided conversations accept TXT, CSV and text extracted locally from DOCX, XLSX and PPTX, within the existing file/text limits. They send filenames and extracted text to the managed AI as untrusted supporting evidence, never instructions. Charts and embedded pictures are not extracted. Evidence participates in the credit reservation size and request fingerprint: changing it invalidates replay of an earlier request. One successful response uses one credit; unsupported PDFs/images are rejected before a provider call. Users must explicitly report and confirm actual experiment results; attachments alone cannot confirm outcomes. Original files are not stored; extracted text is saved in the case history.

## Why free usage may be paused

The wallet paused label corresponds to the database setting `solve_trial_settings.enabled=false`. Setup starts disabled. An organiser may disable it, or the ledger may automatically pause when the provider model/token usage cannot be verified (`p_pause`). Exhausted account and shared budgets have separate messages.

To investigate: Admin → Load trial controls. Check enabled state, event and per-account budgets, model prices, and OpenAI usage/model responses. After resolving the cause, enable trial usage, confirm prices and save. Workshop controls must also release OS mode. Do not assume the remaining credit count means budget is available. Reapproving accounts does not reset spent balances.

The development workspace has no live Supabase/OpenAI credentials; no live balances, budgets or trial settings were changed for this UI release.
