// Dummy Todo provider: full CRUD backed by localStorage, no network required.
// Methods are async so the surface matches the real (axios) provider and the
// UI can treat both identically.

import { readDocument, writeDocument } from '../storage/localStorageRepo.js'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function validationError(message) {
  const err = new Error(message)
  err.code = 'VALIDATION_ERROR'
  return err
}

function notFoundError(id) {
  const err = new Error(`Todo ${id} not found`)
  err.code = 'TODO_NOT_FOUND'
  return err
}

// Validate and normalize the mutable fields of a todo.
function sanitize(todo) {
  const description = (todo?.description ?? '').trim()
  if (!description) {
    throw validationError('Description is required')
  }
  const targetDate = (todo?.targetDate ?? '').trim()
  if (targetDate && !DATE_RE.test(targetDate)) {
    throw validationError('Target date must be in YYYY-MM-DD format')
  }
  return { description, targetDate, done: Boolean(todo?.done) }
}

export const dummyTodoProvider = {
  async listTodos(username) {
    const doc = readDocument()
    return doc.todos.filter((t) => t.username === username)
  },

  async getTodo(username, id) {
    const doc = readDocument()
    const todo = doc.todos.find((t) => t.id === id && t.username === username)
    if (!todo) throw notFoundError(id)
    return todo
  },

  async createTodo(username, todo) {
    const fields = sanitize(todo)
    const doc = readDocument()
    const created = { id: doc.nextId, username, ...fields }
    doc.todos.push(created)
    doc.nextId += 1
    writeDocument(doc)
    return created
  },

  async updateTodo(username, id, todo) {
    const fields = sanitize(todo)
    const doc = readDocument()
    const index = doc.todos.findIndex((t) => t.id === id && t.username === username)
    if (index === -1) throw notFoundError(id)
    const updated = { ...doc.todos[index], ...fields }
    doc.todos[index] = updated
    writeDocument(doc)
    return updated
  },

  async deleteTodo(username, id) {
    const doc = readDocument()
    const index = doc.todos.findIndex((t) => t.id === id && t.username === username)
    if (index === -1) throw notFoundError(id)
    doc.todos.splice(index, 1)
    writeDocument(doc)
    return { id }
  },
}
