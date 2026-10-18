# Todo App (minimal baseline)

A deliberately **feature-limited** React + Vite to-do app. It implements only the
core so that new features and enhancements can be layered on top via your own
workflow.

## Features (intentionally limited)

- Add a todo
- List todos
- Toggle a todo complete / incomplete
- Delete a todo
- Persistence via `localStorage`, behind a swappable `TodoService` abstraction

No auth, no routing, no extra UI libraries. Runs with **no backend** in the
default mock mode.

## Getting started

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run preview  # preview the build
```

## Mock vs real mode (TodoService)

The UI talks to Todos only through a single `TodoService` abstraction
(`src/services/todo/`). Which implementation is used is controlled by the
`VITE_TODO_API_MODE` env var:

| Mode   | Backing store          | Backend required |
| ------ | ---------------------- | ---------------- |
| `mock` | `localStorage` (default) | No             |
| `real` | backend API (not implemented in this project) | Yes |

**Run in mock mode (default):** do nothing — mock mode is used when
`VITE_TODO_API_MODE` is unset. To be explicit, copy `.env.example` to `.env`:

```bash
cp .env.example .env   # sets VITE_TODO_API_MODE=mock
npm run dev
```

**Switch to real mode:** set `VITE_TODO_API_MODE=real` in `.env`. This project
does not ship a backend, so `RealTodoService` throws a clear error until a
backend + client are implemented (see `src/services/todo/realTodoService.js`).

Mock data is persisted per user under `localStorage` key `mm.todos.v1:{username}`.
There is no login yet, so a constant demo user (`demo`) is used.

## Structure

```
src/
  main.jsx                  # app entry
  index.css                 # all styles
  App.jsx                   # wires UI to todoService (async), demo user
  components/
    AddTodoForm.jsx         # new-todo input + submit
    TodoList.jsx            # list + empty state
    TodoItem.jsx            # single row (checkbox, text, delete)
  services/todo/
    types.js                # Todo model + TodoService contract (JSDoc)
    index.js                # single selection point + env toggle + demo user
    mockTodoService.js      # localStorage-backed implementation (default)
    realTodoService.js      # backend placeholder (requires a backend)
```

A todo looks like:

```js
{ id: number, text: string, completed: boolean, targetDate?: 'YYYY-MM-DD' }
```

## Manual verification (mock mode, no backend)

There is no unit-test framework configured in this story; verify manually:

1. `npm install` then `npm run dev`, open the app.
2. The Todos page (`data-testid="todos-page"`) loads with an empty list on first
   run (empty `localStorage` must not crash).
3. Add a todo via the input + **Add** button — it appears in the list.
4. Toggle its checkbox — it shows as completed.
5. Delete it — it disappears.
6. Add a couple of todos, then **refresh** the page — they persist.
7. Inspect `localStorage` and confirm the key `mm.todos.v1:demo` holds
   `{ version: 1, updatedAt, nextId, items: [...] }`.

Stable selectors for future Playwright tests: `todos-page`, `todo-form`,
`todo-description`, `todo-create`, `todo-list`, `todo-row-{id}`,
`todo-toggle-{id}`, `todo-delete-{id}`.

## Where to extend

Each piece is isolated so a workflow can add features with minimal blast radius:

- **Filters (All / Active / Completed)** — derive a filtered list in `App.jsx`,
  add a filter bar component.
- **Inline edit** — add an edit mode to `TodoItem.jsx`; `updateTodo` already
  supports changing `text`.
- **Due dates / priority** — `targetDate` is already modelled; add an input in
  `AddTodoForm.jsx` and pass it through `createTodo`.
- **Backend sync** — implement `realTodoService.js` and set
  `VITE_TODO_API_MODE=real`.
