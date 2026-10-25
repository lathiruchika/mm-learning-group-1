# Todo App (React 18 + Vite)

A single-page to-do app written in plain JavaScript (`.jsx`). There is no router,
no login and no UI library. It runs entirely in the browser in **dummy mode**
(todos live in `localStorage`), or against a backend in **real mode**.

Repo: https://github.com/lathiruchika/mm-learning-group-1

## Features

- Add, edit, complete and delete todos; persisted via `localStorage` in dummy mode
- **Search, filter and sort** (EPMCDMETST-58998)
  - Search is case-insensitive, trimmed, substring match on the description
  - Status filter: All / Done / Not done
  - Sort by target date: default / earliest first / latest first (undated todos always last)
  - Clear resets all three
  - "No todos yet. Add one above." for an empty list (controls hidden);
    "No todos match your filters." when filters match nothing
- **Validation** (EPMCDMETST-66717)
  - Description: required, at least 8 characters after trimming
  - Target date: optional; if set it must be a real calendar date and not in the past
  - Add is disabled while the form is invalid or saving; double-submit is guarded
  - Inline edit saves on Enter or blur and cancels on Escape; an unchanged edit just
    closes; a failed save shows an inline `role="alert"` message
- Loading state and an error banner with Retry (EPMCDMETST-69689)

## Requirements

- Node.js 18 or newer (developed and verified on Node 24) and npm

## Getting started

```bash
npm ci
cp .env.example .env   # PowerShell: Copy-Item .env.example .env
npm run dev
```

`.env.example` sets `VITE_API_MODE=dummy`, so no backend is needed.

## Configuration: dummy vs real

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_MODE` | `real` | `dummy` = in-browser localStorage provider (no network); `real` = axios provider. |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend base URL. Used only in real mode. |

> **The mode is fixed when the app is built or started, not at runtime.** Vite inlines
> `VITE_*` values into the bundle, so changing `VITE_API_MODE` means restarting
> `npm run dev` or running `npm run build` again. If the variable is unset the app
> defaults to **real** mode and will show an error banner without a backend.
> `VITE_*` values are public in the built bundle: never put secrets in them.
> `.env` is gitignored; `.env.example` is tracked.

In dummy mode todos are seeded for user `darshan` and stored under the
`localStorage` key `mm.todos.v1`. In real mode the app calls
`GET/POST/PUT/DELETE /users/{username}/todos[/{id}]` on `VITE_API_BASE_URL`.

## Build and run a production build locally

```bash
VITE_API_MODE=dummy npm run build     # PowerShell: $env:VITE_API_MODE='dummy'; npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

The build output is in `dist/`. Open http://127.0.0.1:4173.

## Tests

```bash
npm test                        # unit tests (Node's built-in runner, no extra install)

npx playwright install chromium # one-time browser download
npm run test:e2e                # Playwright end-to-end tests
```

- Unit tests: `tests/unit/` (list search/filter/sort logic, validation rules; "today" is
  fixed so date tests never depend on the run date).
- E2E tests: `tests/*.spec.js`, Chromium only. The config starts the app itself in dummy
  mode on port 5199, so it will not collide with `npm run dev`.
- The HTML report is written to `playwright-report/index.html` (gitignored).
- Tests find elements by `data-testid` (for example `todo-search-input`,
  `todo-status-filter`, `todo-sort-select`, `todo-add-btn`, `todo-edit-error-<id>`).

## Project structure

```
src/
  main.jsx                       # app entry
  index.css                      # all styles
  App.jsx                        # state + add/toggle/edit/delete via the adapter
  api/
    apiAdapter.js                # todoApi surface; picks provider from VITE_API_MODE
    providers/
      dummyTodoProvider.js       # localStorage CRUD, no network
      realTodoProvider.js        # axios -> backend
    storage/
      localStorageRepo.js        # mm.todos.v1 schema + seed
  components/
    AddTodoForm.jsx              # new-todo inputs, validation, saving state
    TodoList.jsx                 # search/filter/sort controls + list + empty states
    TodoItem.jsx                 # one row: checkbox, description, inline edit, delete
    listUtils.js                 # pure search/filter/sort logic
    validation.js                # pure validation rules
tests/
  unit/                          # node:test unit tests
  *.spec.js                      # Playwright e2e specs
  helpers.js                     # seeding and locator helpers
playwright.config.js
```

A todo looks like:

```js
{ id: number, username: string, description: string, targetDate: string, done: boolean }
```

`targetDate` is `yyyy-MM-dd` or an empty string.

## Known limitations

- No maximum description length is enforced.
- Not covered by automated tests: saving an inline edit by blur, and the loading and
  error/Retry states (the error state only appears in real mode with no backend).
- End-to-end tests run in Chromium only.
- No Docker setup is provided.
- Real mode needs a compatible backend, which this repository does not include.

## Working with AI assistance

`docs/ai/COMMAND_LOG.md` records the AI-assisted changes and verification for each story.
Confluence-ready page drafts are in `docs/confluence-pages.md`.
