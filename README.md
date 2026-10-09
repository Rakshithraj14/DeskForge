# DeskForge

An AI-backed desktop companion. A pixel-art pet lives on your desktop in a transparent, always-on-top window. It roams, sleeps, gets hungry, and when you click it you can type a request ("open VS Code and play some music") that your chosen AI model turns into safe desktop actions.

Built with Electron. Windows is the primary target.

## Features

- **Desktop pet**: transparent draggable overlay with idle, walk, sleep, thinking, success and error animations. Optional cursor-follow mode and ambient messages.
- **Pet stats**: hunger, energy and happiness decay over time. Feed, pet or put it to sleep from the right-click menu. State persists between launches.
- **AI prompts**: click the pet, type a request, and the AI returns a JSON action plan that is validated before anything runs.
- **Providers**: Ollama (local, default), Claude, or OpenAI (Codex). API keys are encrypted with Electron `safeStorage` and never sent to the renderer.
- **Dashboard**: from the tray icon. Stats, quick actions, connection test, provider settings, overlay opacity, and a Pets tab to pick a character.

## Tools the AI can use

The model cannot run shell commands. It can only pick from this allowlist (`src/main/tools/`):

| Tool | What it does |
|------|--------------|
| `open_application` | Launch an app by name (with aliases like `vscode`, `edge`, `settings`), optionally with a URL |
| `open_file` | Open a file with its default app |
| `open_folder` | Open a folder in the file explorer |
| `list_files` | List a directory's contents |
| `play_music` | Open an audio file in the default player |

Anything else in the plan is dropped by `src/main/ai/validate.js`.

## Getting started

Requires Node 22+.

```bash
npm install
npm start
```

For local AI, install [Ollama](https://ollama.com) and pull a model:

```bash
ollama pull llama3.2
```

For Claude or OpenAI, open the dashboard from the tray icon, choose the provider and paste your API key.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm start` | Run the app |
| `npm test` | Run unit tests (`node --test`) |
| `npm run build` | Build the Windows NSIS installer into `dist/` |

## Characters

Each character is a folder in `characters/` with a `character.json` and sprite sheets:

```json
{
  "name": "SalaryCat",
  "type": "cat",
  "frameWidth": 192,
  "frameHeight": 208,
  "scale": 0.577,
  "animations": {
    "idle": { "sheet": "sprites/idle.png", "frames": 6, "fps": 8 },
    "walk": { "sheet": "sprites/walk.png", "frames": 8, "fps": 12 }
  },
  "personality": { "playful": 0.7, "lazy": 0.3, "friendly": 0.8 }
}
```

Required animations: `idle`, `walk`, `sleep`, `thinking`, `success`, `error`. New folders show up in the dashboard's Pets tab automatically.

## Project layout

```
src/
  main/          Electron main process
    ai/          provider adapters (ollama, claude, codex) + plan validation
    tools/       the allowlisted desktop actions
    state/       pet stats, tick loop, persistence
  preload/       context-isolated bridges
  renderer/      overlay (the pet) and settings (dashboard) UIs
characters/      character packs
test/            unit tests
```
