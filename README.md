# Vaulta

A calm place for unfinished thoughts.

Vaulta is a local-first interface for capturing, connecting, and reflecting on your fragments without demanding that you organize them. It uses local AI to synthesize themes quietly in the background, helping you build connections naturally while keeping your ideas safe.

### What Vaulta is not
- A productivity system or a task manager.
- A rigidly structured database requiring extensive tags and folders.
- A cloud service that sends your data to external APIs.

### How to use
- **Capture**: Press `C` from anywhere or tap the capture button to quickly jot down a fragment.
- **Reading Mode**: Expand a fragment for an isolated, distraction-free reading experience.
- **Seeds**: Mark fragments you want to return to as "Seeds", and allow the local AI to gently "Grow" non-intrusive continuations from them.
- **Reflection**: Periodically request reflections to see what overarching themes and patterns have emerged from your recent thoughts.
- **Delete**: Eliminate a fragment permanently whenever you choose.

### Local-first & AI
Your data lives entirely in your browser through IndexedDB. Vaulta relies on [Ollama](https://ollama.com/) for its local AI capabilities, ensuring complete privacy.

### Developer Commands
You will need two processes running simultaneously.

#### Start the web application
```bash
pnpm -C apps/web dev
```

#### Start the local server
```bash
pnpm -C apps/server dev
```

#### Build for production
```bash
pnpm -C apps/web build
pnpm -C apps/server build
```
