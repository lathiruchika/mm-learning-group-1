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

No auth, no routing, no backend, no extra UI libraries.

## Getting started

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run preview  # preview the build
```

## Structure

```
src/
  main.jsx                  # app entry
  index.css                 # all styles
  App.jsx                   # state, localStorage, add/toggle/delete handlers
  components/
    AddTodoForm.jsx         # new-todo input + submit
    TodoList.jsx            # list + empty state
    TodoItem.jsx            # single row (checkbox, text, delete)
```

A todo looks like:

```js
{ id: string, text: string, completed: boolean }
```

## Where to extend

Each piece is isolated so a workflow can add features with minimal blast radius:

- **Filters (All / Active / Completed)** — derive a filtered list in `App.jsx`,
  add a filter bar component.
- **Inline edit** — add an edit mode to `TodoItem.jsx` and an `editTodo` handler
  in `App.jsx`.
- **Due dates / priority** — extend the todo shape and `AddTodoForm.jsx`.
- **Backend sync** — replace the `localStorage` calls in `App.jsx` with API calls.
```
