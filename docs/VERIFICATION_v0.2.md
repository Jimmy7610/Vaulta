# Vaulta v0.2 Verification

Date: 2026-02-20
Tester: Antigravity

## Pre-req
- Ollama installed and running locally (optional for graceful-fail test)
- Recommended model pulled (example):
  - `ollama pull llama3.1`
- Server URL default: http://localhost:8787

## Web (apps/web)
- [x] `pnpm -C apps/web dev` starts with no errors
- [x] Capture saves a new entry (Enter)
- [x] Create at least 3 entries
- [x] Refresh browser → entries persist (IndexedDB)
- [x] Click an entry → detail drawer opens
- [x] Analyze with Ollama running → shows themes/tone/type/summary
- [x] Stop Ollama → Analyze shows friendly error (no crash)

## Server (apps/server)
- [x] `pnpm -C apps/server dev` starts with no errors
- [x] GET /health returns ok + ollama status
- [x] POST /analyze returns ok + meta when Ollama is running
- [x] POST /analyze returns 503 with code OLLAMA_UNREACHABLE when Ollama is stopped

## Notes
- Browser subagent completed verification smoothly.
- IndexedDB handles entry persistence properly across DOM reloads.
- Graceful failure correctly displays "Ollama generate failed" inline when the model (`llama3.1:latest`) or the server is unreachable.

## Model Picker Verification (v0.2.1)
- [x] Server: `GET /health` returns ok
- [x] Server: `GET /ollama/models` returns model list
- [x] Web: Entries persist after refresh
- [x] Web: EntryDetail opens
- [x] Web: Models dropdown loads models dynamically
- [x] Web: Selecting model persists after refresh
- [x] Web: Analyzing using the selected model still performs as expected with the new UI

## UI Pass Verification (v0.2.2)
- [x] UI: Vault grid cards are modernized with tighter typography and hover-elevation.
- [x] UI: EntryDetail layout separates fragment source and analysis.
- [x] UI: Model picker is customized with a seamless dark theme style.
- [x] UI: Analysis metadata displays properly (chips and badges instead of plain text).

## UX Pass Verification (v0.2.3)
- [x] Grid Layout: Entries wrap cleanly in a 4-column responsive grid at desktop size.
- [x] Card Hierarchy: Hierarchy is tight with tags correctly displayed and cards wrapping properly.
- [x] Global Shortcuts: Pressing 'c' instantly opens the Quick Capture modal.
- [x] Quick Capture UX: Modal saves and dismisses instantly upon hitting Enter/Done.
- [x] Feedback: A toast notification appears upon successful save.
- [x] EntryDetail Flow: Analyze button UX shows 'Analyzing...' state with spinner, followed by 'Done' with checkmark.
- [x] Global Shortcuts: 'Escape' dismisses the Quick Capture modal and EntryDetail drawer seamlessly.
