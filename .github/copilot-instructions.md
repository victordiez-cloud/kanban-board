<!-- Copilot / AI agent instructions for the Kanban Board repo -->
# Copilot Instructions — Kanban Board

Purpose: Help AI coding agents be immediately productive in this small static Kanban app.

- **Project type:** Single-page, client-side static app (no build tools). See [index.html](index.html#L1-L40).
- **Language / tech:** HTML, modern JavaScript (ES6+), CSS. No frameworks or npm deps.
- **Primary files:** [index.html](index.html#L1-L200), [script.js](script.js#L1-L120), [style.css](style.css#L1-L200).

Quick run / debug
- Open `index.html` in a browser, or run a static server from the repo root for proper HTTP behavior:

```bash
python -m http.server 8000
# then open http://localhost:8000/
```
- Use browser DevTools console; `script.js` already logs on load (`console.log("Kanban JS loaded...")`).

Architecture & data flow (concise)
- UI is DOM-driven: columns are `.column` elements with `data-status` attributes. Cards are `.card` elements with `data-id` and `data-priority` attributes. See example cards in [index.html](index.html#L11-L40).
- `script.js` wires interactions on `DOMContentLoaded` (event listeners for `#addCardBtn`, `#searchInput`, `#sortByPriorityBtn`). See listener stubs in [script.js](script.js#L1-L120).
- State currently lives in the DOM (data-* attributes). There is no server or persistence layer in the codebase; if adding persistence, prefer `localStorage` for backward-compatible, zero-config behavior.

Project-specific patterns & conventions
- Minimal global scope: code runs within `DOMContentLoaded` handler — follow that pattern when adding behavior.
- Use `data-*` attributes for card metadata (status, id, priority). Example access: `card.dataset.priority` and `column.dataset.status`.
- UI changes should modify DOM attributes (e.g., move a `.card` node into a new `.column`) rather than inventing parallel state objects unless adding full state management.
- UX hints: CSS uses `.card { cursor: grab }` indicating optional drag & drop; prefer `dragstart` / `drop` events or pointer events when implementing DnD.

Examples (use these snippets when editing `script.js`)
- Select all cards:

```js
const cards = document.querySelectorAll('.card');
```
- Read metadata from a card and move it to another column:

```js
const card = document.querySelector('.card[data-id="1"]');
const targetCol = document.querySelector('.column[data-status="doing"]');
targetCol.appendChild(card);
card.dataset.status = 'doing';
```

Conventions for changes & pull requests
- Keep changes small and UI-focused. Because there are no automated tests, include a short manual verification checklist in the PR description (which pages to open, buttons to click, expected DOM changes).
- Preserve French text when editing UI copy unless the change is explicitly for i18n.

What *not* to assume
- There is no backend, bundler, or test framework configured. Do not add build-step assumptions without adding required config files and a README section explaining them.
- No CI is present; do not rely on automated checks unless you add them.

If you need to extend the project
- For persistence: `localStorage` is the simplest path. Example key: `kanban.cards` store a JSON array of card objects and rehydrate DOM on `DOMContentLoaded`.
- For larger refactors: introduce a small module or init function in `script.js` and keep `DOMContentLoaded` wiring minimal.

Files to inspect for examples: [index.html](index.html#L1-L200), [script.js](script.js#L1-L120)

If anything here is incorrect or you want more detail (tests, CI, or adding persistence), tell me which area to expand.
