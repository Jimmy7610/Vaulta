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
