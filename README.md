# Frontend Todo App

This project implements a frontend application for a Todo List using React. By default it runs entirely in the browser against a dummy API adapter that persists to localStorage, so no backend is needed. A real REST backend can still be used via an env flag.

## Overview

The frontend Todo App provides users with a user-friendly interface to manage their tasks efficiently. Integrated with a backend Spring Boot RESTful API, this application allows users to perform CRUD (Create, Read, Update, Delete) operations on their todos with real-time updates reflecting on the backend database.

## Technologies Used

- **React**: Frontend library for building user interfaces.
- **Axios**: Promise-based HTTP client for making requests to the backend API.
- **Integration**: Seamless integration with a backend Spring Boot RESTful API for real-time updates on database changes.

## Features

- **CRUD Operations**: Users can Create, Read, Update, and Delete todos.
- **Real-time Updates**: Changes made in the frontend reflect immediately on the backend database.
- **User Authentication**: Basic authentication implemented for a single user to validate in the frontend.
- **Context API**: Used for managing authentication state across multiple components.
- **Routing**: Implemented with React Router for navigation between different components.

## Getting Started

1. **Clone the Repository**: `git clone https://github.com/your_username/todo-frontend.git`
2. **Navigate to the Project Directory**: `cd todo-frontend`
3. **Install Dependencies**: `npm install`
4. **Start the Application**: `npm run dev`


## Dummy API Mode (default, no backend)

All todo data goes through `src/components/api/TodoApi.js`, which delegates to `DummyTodoAdapter.js` (async CRUD with an artificial delay) unless `VITE_TODO_API_MODE=backend`.

- **Login**: unchanged dummy login, username `darshan`, password `dummy`.
- **Todo shape**: `{ id: number, description: string, done: boolean, targetDate: "YYYY-MM-DD" }`.
- **Persistence**: stored in localStorage under the key `todo:{username}` (for example `todo:darshan`) as a JSON array. Data is normalized on read. If the key is missing or the stored JSON is corrupt, three default todos are seeded. An explicitly empty list stays empty (so the empty state is reachable). Refreshing the page keeps your data; clear the key in DevTools to reset.
- **Storage unavailable**: if localStorage is blocked, the app falls back to in-memory storage and shows a warning banner on the list page.
- **Error model**: failures reject with `{ code, message }`. Codes: `NOT_FOUND`, `STORAGE_UNAVAILABLE`, `SIMULATED_ERROR` (and `VALIDATION_ERROR` if invalid data reaches the adapter).

### Configuration

Copy `.env.example` to `.env.local` and adjust (all optional):

| Variable | Default | Meaning |
| --- | --- | --- |
| `VITE_TODO_API_MODE` | `dummy` | `dummy` (localStorage) or `backend` (axios) |
| `VITE_DUMMY_API_DELAY_MS` | `500` | Artificial latency per call; use `0` in tests |
| `VITE_DUMMY_API_ERROR_RATE` | `0` | Probability 0..1 that a call fails with `SIMULATED_ERROR` |
| `VITE_BACKEND_BASE_URL` | `http://localhost:8080` | Only used in `backend` mode |

### Simulating failures

- Set `VITE_DUMMY_API_ERROR_RATE=1` and restart the dev server to make every call fail, or
- In the browser console run `localStorage.setItem("dummy-api:simulate-error", "1")` (set to `"0"` or remove it to stop). Failed list loads show an error banner with Retry.

### Run steps

1. `npm install` (or `npm ci`)
2. `npm run dev` and open the printed URL
3. Log in with `darshan` / `dummy`, then add, edit and delete todos; refresh to confirm they persist
4. `npm run build` for a production build, `npm run lint` to lint

## UI States

- **List page**: loading indicator while fetching, empty state with an "Add New Todo" call to action, and an error banner with a Retry button that clears on success.
- **Edit page**: loading indicator while fetching, a "Todo not found" panel (with a way back to the list) for unknown ids, and an error banner when saving fails.

## Form Validation Rules

- **Description**: required; leading/trailing whitespace is trimmed, so whitespace-only input is rejected; at least 8 characters after trimming.
- **Target date**: required and must be a real calendar date in `YYYY-MM-DD` format.
- Inline messages appear under the field once it has been touched and clear as soon as the value is corrected.
- The Save button is disabled while the form is invalid or submitting. Cancel returns to the list; a successful save navigates back to `/list-todos`.
- The description is saved trimmed.

### Test ids

`todo-add-cta`, `todo-row-{id}`, `todo-edit-{id}`, `todo-delete-{id}`, `todo-list-loading`, `todo-list-empty`, `todo-list-error-banner`, `todo-list-retry`, `todo-form`, `todo-field-description`, `todo-field-targetDate`, `todo-field-done`, `todo-save`, `todo-cancel`, `todo-form-error-banner`, `todo-not-found`.

## Folder Structure

- **src/**: Contains the source code for the frontend application.
  - **components/**: Contains React components for different parts of the application.
  - **api/**: Contains the API facade (`TodoApi.js`), the dummy localStorage adapter, storage provider and error model.
  - **common/**: Shared UI pieces (ErrorBanner, LoadingIndicator, EmptyState).
  - **security/**: Contains authentication-related components and context provider.
- **public/**: Contains static assets and index.html file.



## Backend Integration

Set `VITE_TODO_API_MODE=backend` (and optionally `VITE_BACKEND_BASE_URL`) to use a REST backend exposing `/users/{username}/todos[/{id}]`. No backend is included in this repository.
