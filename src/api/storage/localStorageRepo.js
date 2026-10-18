// localStorage-backed repository for the dummy Todo provider.
//
// Storage schema (per LLD):
//   key:      mm.todos.v1
//   document: { schemaVersion: 1, nextId: number, todos: Todo[] }
//   Todo:     { id, username, description, targetDate, done }
//
// All access to localStorage for todos goes through this module so the
// schema and seeding live in exactly one place.

const STORAGE_KEY = 'mm.todos.v1'
const SCHEMA_VERSION = 1

// Deterministic seed so /list-todos shows data on first run with no backend.
function seedDocument() {
  return {
    schemaVersion: SCHEMA_VERSION,
    nextId: 4,
    todos: [
      {
        id: 1,
        username: 'darshan',
        description: 'Learn the dummy API provider',
        targetDate: '2026-11-01',
        done: false,
      },
      {
        id: 2,
        username: 'darshan',
        description: 'Wire the UI to the adapter',
        targetDate: '2026-11-05',
        done: true,
      },
      {
        id: 3,
        username: 'darshan',
        description: 'Run the app without a backend',
        targetDate: '2026-11-10',
        done: false,
      },
    ],
  }
}

// Read the document, seeding (and persisting) a default one on first use or
// when the stored value is missing/corrupt.
export function readDocument() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seeded = seedDocument()
      writeDocument(seeded)
      return seeded
    }
    const doc = JSON.parse(raw)
    if (!doc || doc.schemaVersion !== SCHEMA_VERSION || !Array.isArray(doc.todos)) {
      const seeded = seedDocument()
      writeDocument(seeded)
      return seeded
    }
    return doc
  } catch {
    const seeded = seedDocument()
    writeDocument(seeded)
    return seeded
  }
}

export function writeDocument(doc) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(doc))
}
