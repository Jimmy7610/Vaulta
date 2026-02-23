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

---

## How to Use Vaulta

### 1. What Vaulta Is
Vaulta is a calm, local-first sanctuary for your unfinished thoughts. It is designed as a space where ideas can exist in their rawest form without the pressure of immediate utility. 

It is important to remember that Vaulta is not a task manager, a traditional note-taking app, or a productivity system. There are no deadlines here, no "inbox zero" to chase, and no complex tagging systems to maintain. It is simply a place to capture what is on your mind, exactly as it is.

### 2. Core Idea: Fragments First
In Vaulta, we think in *fragments*. A fragment is an incomplete thought, a fleeting observation, or a rough sentence that doesn't yet have a home. 

You are encouraged to input thoughts that are imperfect or incomplete. Do not worry about grammar, structure, or where a fragment "belongs." In Vaulta, structure is something that emerges much later—or perhaps not at all. The value is in the capture, not the organization.

### 3. Capturing Thoughts
Capturing a thought should be as frictionless as possible. You can click the **Capture** button in the header or simply press the `C` key on your keyboard from anywhere in the app.

There is no required format. Type as much or as little as you need. Once you save a fragment, it is stored immediately and exclusively on your local device. 

### 4. Reading and Reviewing
When you want to look back at what you've captured, you can click on any fragment to open its detail view. For a deeper level of focus, you can enter **Reading Mode** by pressing the `R` key.

Reading Mode exists to give you distance and perspective. It strips away the interface, leaving only your words. This isolation helps you see your thoughts clearly, allowing connections to form naturally in your mind.

### 5. Cleaning and Deleting
Not every thought needs to be kept forever. In fact, Vaulta encourages aggressive deletion. 

If a fragment no longer resonates or feels like mental clutter, remove it. Use the delete action freely. In Vaulta, removal is not a failure of memory—it is a feature of a clean and focused thinking space.

### 6. Seeds
Sometimes, a fragment feels like it has the potential for growth. You can mark such fragments as **Seeds**. 

A Seed represents an intentional choice to return to an idea. Seeds are rare; they are the thoughts you want to keep close. Over time, they may "grow" or evolve, but only if and when you decide they should.

### 7. Weekly Reflection
If you find yourself with many fragments, you can use the **Weekly Reflection** feature. This is a quiet, non-intrusive way to see the overarching themes that have been occupying your mind.

Reflection is entirely optional. It is there to help you notice patterns you might have missed, but it never demands your attention. Use it only when you feel the need for a higher-level view of your mental landscape.

### 8. Local-First and Privacy
Trust is the foundation of a thinking space. Vaulta is local-first, meaning every word you type lives only on your machine. Nothing is sent to a cloud server or an external API by default.

Because you own your data, you can also take it with you. Use the **Export** buttons to download your entire vault as a JSON file or a human-readable Markdown document at any time.

### 9. How to Think When Using Vaulta
Vaulta works best when you approach it with a specific mindset:

*   **No Pressure**: You don't "owe" the app anything. There are no streaks to keep and no status bars to fill.
*   **No Inbox Zero**: A long list of fragments is not a "backlog" to be cleared; it is a landscape to be explored.
*   **No Optimization**: Resist the urge to make your capture process "efficient." Vaulta is a thinking surface, not a production system.

Think of Vaulta as a digital workbench where you can spread out your ideas, look at them, move them around, and leave them alone for as long as you need.

