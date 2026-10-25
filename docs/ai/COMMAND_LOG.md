# AI Command Log

## 2026-10-18 — EPMCDMETST-69689: Dummy API provider interface + wiring

Branch: `feature/EPMCDMETST-69689-api-provider-toggle`

### Context
The repo is a frontend-only React 18 + Vite app that previously stored todos
directly in `localStorage` from `App.jsx` (shape `{id, text, completed}`, no
backend, no router, no login). There was no axios client or `/list-todos`
route to refactor, so the story was adapted to the actual codebase while
satisfying the acceptance criteria.

### Key Claude actions
- Added env-driven API adapter `src/api/apiAdapter.js` exporting a single
  `todoApi` surface; provider chosen by `import.meta.env.VITE_API_MODE`
  (`dummy` | `real`, defaults to `real`).
- Added `src/api/providers/dummyTodoProvider.js` — localStorage-backed CRUD,
  no network, validation (`VALIDATION_ERROR` / `TODO_NOT_FOUND`).
- Added `src/api/storage/localStorageRepo.js` — schema `mm.todos.v1`
  `{schemaVersion:1, nextId, todos[]}`, seeded for user `darshan`.
- Added `src/api/providers/realTodoProvider.js` — axios client, baseURL from
  `VITE_API_BASE_URL` (default `http://localhost:8080`), standard
  `/users/{username}/todos` endpoints.
- Wired `App.jsx` + components to the adapter with loading/error/empty states
  and inline edit; adopted LLD Todo shape `{id, username, description,
  targetDate, done}`.
- Added LLD data-testid hooks (todos-page, todos-loading, todos-error,
  todos-retry-btn, todos-empty, todos-table, todo-row-*, todo-edit-btn-*,
  todo-delete-btn-*, todo-done-checkbox-*, todo-add-btn, todo-description-input,
  todo-targetDate-input, todo-form-error, todo-editor-page).
- Added `axios` dependency; added `.env.example`; gitignored local `.env`.

### Commands executed
| Command | Result |
| --- | --- |
| `git checkout -b feature/EPMCDMETST-69689-api-provider-toggle` | OK |
| `npm install` | OK — added axios (25 packages) |
| `npm run build` (`vite build`) | PASS — 93 modules transformed, built in ~0.7s |
| `node tmp-smoke.mjs` (temp dummy-provider CRUD smoke, then deleted) | PASS — list/create/get/update/delete + validation, no network |

Note: `package.json` has no `test` script, so unit tests were skipped per
story instructions.

### Verification notes
- Build passes, confirming the full module graph (adapter, both providers,
  axios, rewired UI) resolves and compiles.
- Dummy-provider CRUD verified programmatically in Node with a `localStorage`
  shim: seed list (3) → create (id=4) → get → update → validation error →
  not-found error → delete (back to 3) → persisted schema `mm.todos.v1`.
- Interactive browser click-through was not performed in this environment
  (no browser automation available; dev-server probe blocked by sandbox).
  To verify manually: `cp .env.example .env` (set `VITE_API_MODE=dummy`),
  `npm run dev`, open the app with the backend OFF, and exercise
  list/add/edit/toggle/delete.

## 2026-10-25 — EPMCDMETST-58998: Search / filter / sort on the todo list

Branch: `feature/EPMCDMETST-58998-search-filter-sort` (stacked on `feature/EPMCDMETST-69689-api-provider-toggle`)

### Context
Dev Work Order DWO 3 from the CodeMie "Part 1 — Plan & Design" workflow. The DWO
referenced `ListTodosComponent.jsx`, which does not exist in this repo; the
equivalent surface is `src/components/TodoList.jsx`, so the story was adapted
to it. Behaviour follows the acceptance criteria unchanged.

### Key Claude actions
- Added `src/components/listUtils.js` — pure `applySearchFilterSort` (case-insensitive
  description search, All/Done/Not done filter, target-date asc/desc sort;
  undated todos always last; input never mutated).
- Reworked `TodoList.jsx` to hold view state locally, render the controls and a
  "No todos match your filters." empty state (distinct from "No todos yet").
- Added control styles to `src/index.css`.
- data-testids: `todo-list-controls`, `todo-search-input`, `todo-status-filter`,
  `todo-sort-select`, `todo-clear-filters-btn`; reused `todos-empty` and `todos-table`.

### Verification
- `npm ci && npm run build` — passes.
- Node assertion script exercising `applySearchFilterSort` (search, both
  status filters, both sort directions, combined, no-match, no mutation) — 9/9 pass.
- Not yet verified in a browser; Playwright coverage is planned in Part 2.

## 2026-10-25 — EPMCDMETST-66717: Form validation hardening

Branch: `feature/EPMCDMETST-66717-form-validation-hardening` (stacked on `feature/EPMCDMETST-58998-search-filter-sort`)

### Context
Dev Work Order DWO 4. The DWO targeted `TodoComponent.jsx` (Formik); this repo has
no Formik or router, so the change is in `AddTodoForm.jsx` and the inline editor
in `TodoItem.jsx`.

### Key Claude actions
- Added `src/components/validation.js` — pure validators. Description: required,
  trimmed length >= 8. Target date: optional; if present must be a real calendar
  date (rejects 2026-02-31) and today or later (local day, not UTC).
- `AddTodoForm.jsx`: inline errors shown once a field is touched, Add disabled while
  invalid or saving, "Saving…" label, double-submit guard, trims description before save.
- `TodoItem.jsx`: inline edit uses the same description rule; unchanged text just closes
  (older todos may be < 8 chars); save failures show an inline message instead of an
  unhandled rejection; Escape cancels.
- data-testids: `todo-description-error`, `todo-targetDate-error`, `todo-edit-error-<id>`.

### Decisions to confirm
- Target date left optional (matches the dummy provider and existing seed data). The FRD
  could be read as "required"; flip in `validateTargetDate` if so.

### Verification
- `npm run build` — passes.
- Node assertions on the validators (empty/whitespace, 7 vs 8 chars after trim, today
  allowed, yesterday rejected, Feb 31, month 13, wrong formats) — all pass.
- Not yet verified in a browser; Playwright coverage is planned in Part 2.
