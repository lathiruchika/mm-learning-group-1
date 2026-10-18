/**
 * MockTodoService — a backend-free TodoService backed by localStorage.
 *
 * This is the default implementation so the app runs in a demo-safe mode with
 * no backend dependency. Data is persisted per user under the key
 * `mm.todos.v1:{username}` using the versioned store shape below.
 *
 * Store shape (version 1):
 *   { version: 1, updatedAt: ISOString, nextId: number, items: Todo[] }
 *
 * Migration: if the stored value is a bare array (an earlier, unversioned
 * format), it is wrapped into the v1 shape and `nextId` is computed from the
 * existing items.
 *
 * @typedef {import('./types.js').Todo} Todo
 * @typedef {import('./types.js').TodoInput} TodoInput
 * @typedef {import('./types.js').TodoService} TodoService
 */

const STORE_VERSION = 1
const KEY_PREFIX = 'mm.todos.v1:'
// Legacy key used by the pre-service inline implementation (bare array).
const LEGACY_KEY = 'todos'

function storageKey(username) {
  return `${KEY_PREFIX}${username}`
}

/** Normalise a value to an ISO YYYY-MM-DD string, or return undefined. */
function toIsoDate(value) {
  if (!value) return undefined
  // Already YYYY-MM-DD.
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString().slice(0, 10)
}

/** Coerce a loosely-shaped item into a well-formed Todo. */
function normaliseItem(raw, fallbackId) {
  const id = Number.isInteger(raw?.id) ? raw.id : fallbackId
  return {
    id,
    text: typeof raw?.text === 'string' ? raw.text : String(raw?.text ?? ''),
    completed: Boolean(raw?.completed),
    ...(toIsoDate(raw?.targetDate) ? { targetDate: toIsoDate(raw.targetDate) } : {}),
  }
}

/** Build an empty v1 store. */
function emptyStore() {
  return { version: STORE_VERSION, updatedAt: new Date().toISOString(), nextId: 1, items: [] }
}

/**
 * Wrap a bare array of items into the v1 store shape, assigning numeric ids
 * where missing and computing nextId.
 */
function migrateArray(arr) {
  let maxId = 0
  const items = arr.map((raw, index) => {
    const item = normaliseItem(raw, index + 1)
    if (item.id > maxId) maxId = item.id
    return item
  })
  return {
    version: STORE_VERSION,
    updatedAt: new Date().toISOString(),
    nextId: maxId + 1,
    items,
  }
}

/**
 * Read the v1 store for a user. Handles:
 *  - missing key (returns empty store, optionally seeded from the legacy key)
 *  - bare-array migration
 *  - corrupt JSON (falls back to empty store rather than crashing)
 */
function readStore(username) {
  const key = storageKey(username)
  let raw
  try {
    raw = localStorage.getItem(key)
  } catch {
    return emptyStore()
  }

  if (raw == null) {
    // One-time seed from the legacy unversioned `todos` array, if present.
    try {
      const legacy = localStorage.getItem(LEGACY_KEY)
      if (legacy != null) {
        const parsed = JSON.parse(legacy)
        if (Array.isArray(parsed)) return migrateArray(parsed)
      }
    } catch {
      /* ignore legacy parse errors */
    }
    return emptyStore()
  }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return emptyStore()
  }

  // Migration: bare array -> v1 wrapper.
  if (Array.isArray(parsed)) return migrateArray(parsed)

  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
    const items = parsed.items.map((item, index) => normaliseItem(item, index + 1))
    const maxId = items.reduce((m, it) => Math.max(m, it.id), 0)
    return {
      version: STORE_VERSION,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      nextId: Number.isInteger(parsed.nextId) && parsed.nextId > maxId ? parsed.nextId : maxId + 1,
      items,
    }
  }

  return emptyStore()
}

/** Persist the store for a user. */
function writeStore(username, store) {
  store.updatedAt = new Date().toISOString()
  try {
    localStorage.setItem(storageKey(username), JSON.stringify(store))
  } catch {
    /* storage full / unavailable — keep in-memory behaviour, do not crash */
  }
  return store
}

/** @type {TodoService} */
export const mockTodoService = {
  async listTodos(username) {
    return readStore(username).items
  },

  async createTodo(username, input) {
    const store = readStore(username)
    /** @type {Todo} */
    const todo = {
      id: store.nextId,
      text: (input?.text ?? '').trim(),
      completed: Boolean(input?.completed),
      ...(toIsoDate(input?.targetDate) ? { targetDate: toIsoDate(input.targetDate) } : {}),
    }
    store.items = [todo, ...store.items]
    store.nextId = store.nextId + 1
    writeStore(username, store)
    return todo
  },

  async updateTodo(username, id, input) {
    const store = readStore(username)
    const index = store.items.findIndex((t) => t.id === id)
    if (index === -1) throw new Error(`Todo ${id} not found for user ${username}`)
    const existing = store.items[index]
    /** @type {Todo} */
    const updated = {
      ...existing,
      ...(input?.text !== undefined ? { text: String(input.text).trim() } : {}),
      ...(input?.completed !== undefined ? { completed: Boolean(input.completed) } : {}),
      ...(input?.targetDate !== undefined ? { targetDate: toIsoDate(input.targetDate) } : {}),
    }
    store.items[index] = updated
    writeStore(username, store)
    return updated
  },

  async deleteTodo(username, id) {
    const store = readStore(username)
    store.items = store.items.filter((t) => t.id !== id)
    writeStore(username, store)
  },
}

// Exported for potential future unit tests / advanced callers.
export const __internals = { storageKey, toIsoDate, migrateArray, readStore }
