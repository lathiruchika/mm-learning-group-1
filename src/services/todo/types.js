/**
 * Domain model + service contract for Todos.
 *
 * This project is plain JavaScript, so the "interface" is expressed as JSDoc
 * typedefs. Both MockTodoService and RealTodoService conform to the TodoService
 * shape below, which lets the UI depend on a single abstraction (see ./index.js).
 */

/**
 * A single todo item.
 *
 * @typedef {Object} Todo
 * @property {number} id         Incremental numeric id, unique per user.
 * @property {string} text       The todo description shown in the UI.
 * @property {boolean} completed Whether the todo is done.
 * @property {string} [targetDate] Optional ISO date string (YYYY-MM-DD).
 */

/**
 * Input accepted when creating or updating a todo. All fields optional on
 * update; `text` is required on create.
 *
 * @typedef {Object} TodoInput
 * @property {string} [text]
 * @property {boolean} [completed]
 * @property {string} [targetDate] ISO date string (YYYY-MM-DD).
 */

/**
 * The service contract the UI depends on. Implementations may be backed by
 * localStorage (mock) or a real backend (real).
 *
 * All methods are async so the same contract works for both in-memory/local
 * storage and network-backed implementations.
 *
 * @typedef {Object} TodoService
 * @property {(username: string) => Promise<Todo[]>} listTodos
 * @property {(username: string, input: TodoInput) => Promise<Todo>} createTodo
 * @property {(username: string, id: number, input: TodoInput) => Promise<Todo>} updateTodo
 * @property {(username: string, id: number) => Promise<void>} deleteTodo
 */

export {}
