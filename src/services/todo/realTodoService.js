/**
 * RealTodoService — placeholder for the backend-backed implementation.
 *
 * This story (EPMCDMETST-69649) is frontend-only and introduces mock mode so
 * the app runs without a backend. There is no backend/API client in this
 * project yet, so the real implementation is intentionally not wired up here.
 *
 * When a backend exists, implement these methods (e.g. with fetch/axios) and
 * keep the same TodoService contract defined in ./types.js. Selecting this
 * implementation requires VITE_TODO_API_MODE=real (see ./index.js).
 *
 * @typedef {import('./types.js').TodoService} TodoService
 */

function notImplemented() {
  throw new Error(
    'RealTodoService requires a backend, which is not available in this project. ' +
      'Run in mock mode (VITE_TODO_API_MODE=mock, the default).',
  )
}

/** @type {TodoService} */
export const realTodoService = {
  async listTodos() {
    return notImplemented()
  },
  async createTodo() {
    return notImplemented()
  },
  async updateTodo() {
    return notImplemented()
  },
  async deleteTodo() {
    return notImplemented()
  },
}
