# Task: Gentle Reminders (v0.7.3)

🤖 **Applying knowledge of `@orchestrator` and `@frontend-specialist`...**

## 1. Goal
Implement Gentle Reminders natively into Vaulta. A single-line, local-first nudge engine driven by app data state (Zustand), prioritized to only ever show a maximum of a single reminder at once without intrusive styles or clickable dismissals.

## 2. Approach
* Data Engine: A custom React hook `useGentleReminder` combining `useEntriesStore` and `useReflectionStore`.
* Logic: Compute values purely declaratively based on `Date.now()`, `meta.type`, and `themes` frequencies.
* UI Integration: Render explicitly low-contrast text in `AppShell` with the style `<p className="text-sm text-neutral-500 italic">` as requested. Ensure positioning sits between the header and main layout.
