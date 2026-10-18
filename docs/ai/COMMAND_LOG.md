# Command Log — EPMCDMETST-69649

Story: Introduce a frontend mock Todo API layer so the app runs without a
backend dependency (default demo-safe mock mode).

## Branch

`feature/EPMCDMETST-69649-mock-todo-service` (off `main`)

## Key files changed

Added:

- `src/services/todo/types.js` — Todo model + TodoService contract (JSDoc; JS project).
- `src/services/todo/mockTodoService.js` — localStorage-backed implementation
  (key `mm.todos.v1:{username}`, versioned store, array→v1 migration, numeric ids,
  ISO `YYYY-MM-DD` targetDate normalisation).
- `src/services/todo/realTodoService.js` — backend placeholder (throws until a
  backend exists; frontend-only story).
- `src/services/todo/index.js` — single selection point, `VITE_TODO_API_MODE`
  toggle (default `mock`), `DEMO_USER` constant.
- `.env.example` — `VITE_TODO_API_MODE` with comments.
- `docs/ai/COMMAND_LOG.md` — this file.

Modified:

- `src/App.jsx` — wired UI to `todoService` (async list/create/update/delete)
  using the `demo` user; added `data-testid="todos-page"`.
- `src/components/AddTodoForm.jsx` — `data-testid` on form/input/create button.
- `src/components/TodoList.jsx` — `data-testid` on list + empty state.
- `src/components/TodoItem.jsx` — `data-testid` on row/toggle/delete (per id).
- `README.md` — mock vs real mode docs, structure, manual verification steps,
  stable selector list, extension notes.

## Commands executed

```
git checkout main
git pull --ff-only           # already up to date
git checkout -b feature/EPMCDMETST-69649-mock-todo-service
npm install                  # ok (vite 5, react 18)
npm run build                # ok — 37 modules transformed, built in ~0.5s
```

No lint / typecheck / unit-test scripts are configured in this repo, so those
steps were not run (per story: do not introduce a new test framework in this
story). Manual verification steps are documented in README.md.

Live dev-server smoke test (`npm run dev` + curl) could not be run in the agent
sandbox (blocked); the production build passing confirms the service modules
compile and bundle. Verify the running app manually via `npm run dev`.

## Notable decisions

- This app has **no login/username and no pre-existing API client** (todos were
  managed inline in `App.jsx` via `localStorage`). The TodoService contract keeps
  the story's `username` parameter but a constant `demo` user is used (demo-safe).
- Kept the current UI Todo shape (`{ id, text, completed }`) to keep UI changes
  minimal (AC #3); `targetDate` (ISO `YYYY-MM-DD`) is modelled + normalised in the
  service but no date input was added to the UI in this story.
- IDs switched from random UUID strings to incremental numeric ids per user (as
  specified); migration handles legacy bare-array storage and the old `todos` key.
- `real` mode is a placeholder that throws a clear error (no backend in scope).
