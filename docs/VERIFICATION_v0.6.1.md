# Vaulta v0.6.1 Verification (Map Fix + Refinements)

Date: 2026-02-20
Tester: Agent Subsystem

## Map Fix
- [x] view=map shows Map (not Vault search/filters)
- [x] Graph is visible and interactive (pan/zoom)
- [x] Hover tooltip works
- [x] Click node opens EntryDetail
- [x] No console errors

## Refinements
- [x] Theme filter works + persists in URL
- [x] Focus mode dims unrelated nodes
- [x] Unclustered toggle hides/shows nodes without themes
- [x] Refresh preserves Map state via URL

## Notes
- Map header controls function responsively and alter the visual opacity and clustering state efficiently without breaking the standard Graph logic layout loop.
- Focus mode requires dynamic tracking of neighbors on each node Hover event, applying fractional alphas to unconnected siblings.
