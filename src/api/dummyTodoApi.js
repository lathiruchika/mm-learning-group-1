// Dummy Todo API — localStorage-backed CRUD with optional latency/failure.
//
// localStorage keys
//   mm.todos.v1        Todo[]
//   mm.todos.meta.v1   { nextId, seededAt, schemaVersion }
//
// Env controls (via apiConfig):
//   VITE_DUMMY_API_LATENCY_MS   adds artificial delay to every call
//   VITE_DUMMY_FAIL_RATE        0..1 — fraction of calls that fail randomly
//                               (0 = never, 1 = always, 0.3 = 30% chance)

import { DUMMY_LATENCY_MS, DUMMY_FAIL_RATE } from '../config/apiConfig.js'

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
    if (import.meta.env.DEV) console.warn('[dummyTodoApi] localStorage read failed')
    return null
  }
}

function writeTodos(todos) {
  try {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos))
  } catch {
    if (import.meta.env.DEV) console.warn('[dummyTodoApi] localStorage write failed (quota?)')
  }
}

function readMeta() {
  try {
    const raw = localStorage.getItem(META_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    if (import.meta.env.DEV) console.warn('[dummyTodoApi] localStorage meta read failed')
    return null
  }
}

function writeMeta(meta) {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta))
  } catch {
    if (import.meta.env.DEV) console.warn('[dummyTodoApi] localStorage meta write failed')
  }
}

// Seed default todos on first run (or after localStorage clear).
// NOTE: schema version bump resets local data — acceptable for this demo app.
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

// ── validation ───────────────────────────────────────────────────────────────

function validateTodoData(data) {
  if (!data.description || data.description.trim().length < 8) {
    throw new Error('Description must be at least 8 characters.')
  }
  if (!data.targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(data.targetDate)) {
    throw new Error('Target date must be a valid YYYY-MM-DD string.')
  }
}

// ── simulation helpers ───────────────────────────────────────────────────────

async function simulateDelay() {
  if (DUMMY_LATENCY_MS > 0) {
    await new Promise((resolve) => setTimeout(resolve, DUMMY_LATENCY_MS))
  }
}

// Probabilistic failure: VITE_DUMMY_FAIL_RATE=0.3 fails ~30% of calls.
// E2E tests can also inject failures at runtime via window.__PW_DUMMY_FAIL=true
// (set after page load so initial seed succeeds but subsequent ops fail).
function maybeSimulateFailure() {
  const testInject = typeof window !== 'undefined' && window.__PW_DUMMY_FAIL
  if (testInject) {
    throw new Error('Simulated API failure (test injection)')
  }
  if (DUMMY_FAIL_RATE > 0 && Math.random() < DUMMY_FAIL_RATE) {
    throw new Error(`Simulated API failure (VITE_DUMMY_FAIL_RATE=${DUMMY_FAIL_RATE})`)
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
    // Normalise id to string to guard against numeric IDs from other sources.
    const todo = todos.find((t) => t.id === String(id) && t.username === username)
    if (!todo) throw new Error(`Todo ${id} not found`)
    return todo
  },

  // POST /users/{username}/todos
  async createTodo(username, data) {
    await simulateDelay()
    maybeSimulateFailure()
    validateTodoData(data)
    const todos = ensureSeeded()
    const todo = {
      id: allocateId(),
      username,
      description: data.description.trim(),
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
    // Only validate description/targetDate when they are explicitly supplied.
    if (data.description !== undefined || data.targetDate !== undefined) {
      validateTodoData({
        description: data.description ?? 'placeholder-skip',
        targetDate: data.targetDate ?? '2000-01-01',
        ...data,
      })
    }
    const todos = ensureSeeded()
    const idx = todos.findIndex((t) => t.id === String(id) && t.username === username)
    if (idx === -1) throw new Error(`Todo ${id} not found`)
    const updated = {
      ...todos[idx],
      ...data,
      description: data.description != null ? data.description.trim() : todos[idx].description,
    }
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
