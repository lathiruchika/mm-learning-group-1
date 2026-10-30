// Dummy Todo API — localStorage-backed CRUD with optional latency/failure.
//
// localStorage keys
//   mm.todos.v1        Todo[]
//   mm.todos.meta.v1   { nextId, seededAt, schemaVersion }
//
// Env controls (via apiConfig):
//   VITE_DUMMY_API_LATENCY_MS   adds artificial delay to every call
//   VITE_DUMMY_API_FAIL=true    causes every call to throw (test error states)

import { DUMMY_LATENCY_MS, DUMMY_FAIL } from '../config/apiConfig.js'

const TODOS_KEY = 'mm.todos.v1'
const META_KEY  = 'mm.todos.meta.v1'
const SCHEMA_VERSION = 1

const SEED_TODOS = [
  {
    id: '1',
    username: 'demo-user',
    description: 'Buy groceries for the week',
    targetDate: '2026-11-05',
    done: false,
  },
  {
    id: '2',
    username: 'demo-user',
    description: 'Finish capstone frontend implementation',
    targetDate: '2026-11-10',
    done: false,
  },
  {
    id: '3',
    username: 'demo-user',
    description: 'Review pull request for dummy API layer',
    targetDate: '2026-11-03',
    done: true,
  },
]

// ── persistence helpers ──────────────────────────────────────────────────────

function readTodos() {
  try {
    const raw = localStorage.getItem(TODOS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeTodos(todos) {
  try {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos))
  } catch {
    // ignore quota errors in read-only / private contexts
  }
}

function readMeta() {
  try {
    const raw = localStorage.getItem(META_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeMeta(meta) {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta))
  } catch { /* ignore */ }
}

// Seed default todos on first run (or after localStorage clear).
function ensureSeeded() {
  const meta = readMeta()
  if (!meta || meta.schemaVersion !== SCHEMA_VERSION) {
    writeTodos(SEED_TODOS)
    writeMeta({
      nextId: 100,
      seededAt: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
    })
    return [...SEED_TODOS]
  }
  return readTodos() ?? [...SEED_TODOS]
}

function allocateId() {
  const meta = readMeta() ?? { nextId: 100 }
  const id = String(meta.nextId)
  writeMeta({ ...meta, nextId: meta.nextId + 1 })
  return id
}

// ── simulation helpers ───────────────────────────────────────────────────────

async function simulateDelay() {
  if (DUMMY_LATENCY_MS > 0) {
    await new Promise((resolve) => setTimeout(resolve, DUMMY_LATENCY_MS))
  }
}

function maybeSimulateFailure() {
  if (DUMMY_FAIL) {
    throw new Error('Simulated API failure (VITE_DUMMY_API_FAIL=true)')
  }
}

// ── public API surface (mirrors REST contract from LLD) ─────────────────────

export const dummyTodoApi = {
  // GET /users/{username}/todos
  async getTodos(username) {
    await simulateDelay()
    maybeSimulateFailure()
    const todos = ensureSeeded()
    return todos.filter((t) => t.username === username)
  },

  // GET /users/{username}/todos/{id}
  async getTodo(username, id) {
    await simulateDelay()
    maybeSimulateFailure()
    const todos = ensureSeeded()
    const todo = todos.find((t) => t.id === String(id) && t.username === username)
    if (!todo) throw new Error(`Todo ${id} not found`)
    return todo
  },

  // POST /users/{username}/todos
  async createTodo(username, data) {
    await simulateDelay()
    maybeSimulateFailure()
    const todos = ensureSeeded()
    const todo = {
      id: allocateId(),
      username,
      description: data.description,
      targetDate: data.targetDate,
      done: false,
    }
    writeTodos([...todos, todo])
    return todo
  },

  // PUT /users/{username}/todos/{id}
  async updateTodo(username, id, data) {
    await simulateDelay()
    maybeSimulateFailure()
    const todos = ensureSeeded()
    const idx = todos.findIndex((t) => t.id === String(id) && t.username === username)
    if (idx === -1) throw new Error(`Todo ${id} not found`)
    const updated = { ...todos[idx], ...data }
    const next = [...todos]
    next[idx] = updated
    writeTodos(next)
    return updated
  },

  // DELETE /users/{username}/todos/{id}  → void (204)
  async deleteTodo(username, id) {
    await simulateDelay()
    maybeSimulateFailure()
    const todos = ensureSeeded()
    writeTodos(todos.filter((t) => !(t.id === String(id) && t.username === username)))
  },
}
