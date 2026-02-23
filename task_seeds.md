# Task: Seeds Feature (v0.7.2)

🤖 **Applying knowledge of `@backend-specialist` and `@frontend-specialist`...**

## 1. Goal
Implement Seeds natively into Vaulta, a local-first application. Emphasizing attention over organization. Users can mark fragments to return to later, and use AI "Grow" functions for quiet continuations.

## 2. Approach
* Database: Add `isSeed` gracefully to IndexedDB `Entry` and Zustand store logic.
* Server `/grow` Route: Implement lightweight integration using strictly-JSON outputs and prompt engineering aimed at reducing motivational "noise" typical in AI responses.
* UI Construction: Use modern, accessible, and highly subtle layout modifications for the `AppShell` and `EntryDetail` components representing a Premium, native feeling design without overbearing components. No new bloated libraries or components required.
