# Aura ✨ — AI-Powered Writing Assistant

Aura includes two experiences:

- **Aura Web** — a responsive React writing studio for improving, rewriting, and shortening text.
- **Aura Chrome Extension** — the original Manifest V3 extension with the Alt + A inline suggestion workflow.

## Aura Web

### Install and run locally

The web app has its own package manifest under `web/`. Install its dependencies from the repository root:

```bash
npm install --prefix web
npm run dev:web
```

Create a production build:

```bash
npm run build:web
```

Preview the production build:

```bash
npm run preview:web
```

Open **API settings** in the app and add your OpenAI API key. The key is stored in this browser's local storage. Your draft is sent directly from the browser to OpenAI only when you request an edit.

### Web app features

- Improve, rewrite, and shorten writing
- Professional, friendly, academic, confident, concise, persuasive, and casual tones
- Live word and character counts
- Copy the refined result or use it as the next draft
- Responsive dark interface
- Bring-your-own OpenAI API key

## Chrome Extension

The original extension source remains in `extension/`.

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Choose **Load unpacked**
4. Select the `extension/` directory
5. Open the Aura extension popup and configure your OpenAI API key
6. Select text on a webpage and press **Alt + A**

## Privacy and security

- The web app stores the API key in browser local storage on the device where it is entered.
- The extension stores its API key using Chrome sync storage.
- Writing text is sent to OpenAI only when you request a suggestion.
- Never publish or commit API keys.
- For a public multi-user production deployment, use a server-side API proxy with authentication and rate limiting rather than collecting API keys in a public client.
- The extension renders AI-generated text as text, not executable HTML.

## Build checks

GitHub Actions runs the web production build on pushes and pull requests targeting this branch. The workflow installs the web app's dependencies and runs `npm run build:web`.

## Tech stack

React, Vite, JavaScript, CSS, OpenAI Chat Completions API, and Chrome Manifest V3.

## Built by

[Kartikey Dixit](https://github.com/its-kartikey90)
