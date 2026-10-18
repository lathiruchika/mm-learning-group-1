# Todo App (minimal baseline)

A deliberately **feature-limited** React + Vite to-do app. It implements only the
core so that new features and enhancements can be layered on top via your own
workflow.

## Features (intentionally limited)

- Add a todo
- List todos
- Toggle a todo complete / incomplete
- Delete a todo
- Persistence via `localStorage`

No auth, no routing, no extra UI libraries. Todo access goes through a small
API adapter so the app can run against a **dummy provider** (in-browser, no
backend) or a **real provider** (axios → backend).

## Getting started

```bash
npm install
cp .env.example .env   # defaults to dummy mode (no backend needed)
npm run dev            # start dev server
npm run build          # production build
npm run preview        # preview the build
```

## API mode (dummy vs real)

The app selects a Todo provider at runtime from `VITE_API_MODE`:

| Var | Default | Purpose |
| --- | --- | --- |
| `VITE_API_MODE` | `real` | `dummy` = in-browser localStorage provider (no network); `real` = axios-backed provider. |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend base URL. Used **only** in real mode; ignored in dummy mode. |

Env vars are read via `import.meta.env.VITE_*`. Copy `.env.example` to `.env`
and edit as needed (`.env` is gitignored — never commit secrets).

### Run without a backend (dummy mode)

```bash
# .env
VITE_API_MODE=dummy
```

Then `npm run dev`. Todos are seeded for user `darshan` and persisted in
`localStorage` under key `mm.todos.v1`. Create / edit / toggle / delete all
work with no backend running.

### Run against a real backend

```bash
# .env
VITE_API_MODE=real
VITE_API_BASE_URL=http://localhost:8080
```

The real provider calls `GET/POST/PUT/DELETE /users/{username}/todos[/{id}]`.

## Structure

```
src/
  main.jsx                       # app entry
  index.css                      # all styles
  App.jsx                        # state + add/toggle/edit/delete via the adapter
  api/
    apiAdapter.js                # todoApi surface; picks provider from VITE_API_MODE
    providers/
      dummyTodoProvider.js       # localStorage CRUD, no network
      realTodoProvider.js        # axios → backend
    storage/
      localStorageRepo.js        # mm.todos.v1 schema + seed
  components/
    AddTodoForm.jsx              # new-todo inputs + submit
    TodoList.jsx                 # list + empty state
    TodoItem.jsx                 # single row (checkbox, description, edit, delete)
```

A todo looks like:

```js
{ id: number, username: string, description: string, targetDate: string, done: boolean }
```

## Where to extend

Each piece is isolated so a workflow can add features with minimal blast radius:

- **Filters (All / Active / Completed)** — derive a filtered list in `App.jsx`,
  add a filter bar component.
- **Priority** — extend the todo shape and `AddTodoForm.jsx`.
- **Backend sync** — flip `VITE_API_MODE=real` and implement the matching
  endpoints; the UI already talks only to the adapter.
