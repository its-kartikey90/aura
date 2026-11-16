# Aura ✨ — AI-Powered Writing Assistant

Aura is a privacy-conscious AI writing assistant with two experiences:

- **Aura Web** — a responsive React writing studio for improving, rewriting, and shortening text.
- **Aura Chrome Extension** — the original Manifest V3 extension with the Alt + A inline suggestion workflow.

## Aura Web

### Run locally

```bash
npm install
npm run dev:web
```

The web app runs with Vite. To create a production build:

```bash
npm run build:web
```

Open the app, choose **API settings**, and add your OpenAI API key. The key is stored in this browser's local storage. Your draft is sent directly from the browser to OpenAI for the requested edit; Aura does not save draft text or keep a writing history.

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
- Do not publish or commit API keys. For a multi-user production deployment, use a secure server-side API proxy and user authentication rather than collecting keys in a public client.

## Tech stack

React, Vite, JavaScript, CSS, OpenAI Chat Completions API, and Chrome Manifest V3.

## Built by

[Kartikey Dixit](https://github.com/its-kartikey90)
