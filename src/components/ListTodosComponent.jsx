// ListTodosComponent — displays todos with loading, empty, and error states.
// Handles per-row delete progress + delete error (EPMCDMETST-70449, 70450).
//
// Race-condition guard: a fetchId ref ensures only the latest in-flight
// request updates state; stale responses from rapid refreshes are silently
// dropped and unmount-time state updates are prevented.

import { useState, useEffect, useCallback, useRef } from 'react'
import { todoApi } from '../api/todoApiFactory.js'
import { normalizeError } from '../api/errorNormalizer.js'
import { APP_USERNAME } from '../config/apiConfig.js'
import ErrorBanner from './ErrorBanner.jsx'

// How long (ms) to show the delete-success inline message before clearing it.
const DELETE_SUCCESS_TTL = 3000

function ListTodosComponent({ onEdit, refreshTrigger }) {
  const [todos, setTodos]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  // { [id]: 'deleting' | 'success' | <error string> }
  const [deleteState, setDeleteState] = useState({})

  // Monotonic counter — lets us discard responses from superseded fetches.
  const fetchIdRef = useRef(0)

  // Stable fetch function; todoApi and APP_USERNAME are module-level constants.
  const fetchTodos = useCallback(async () => {
    const fetchId = ++fetchIdRef.current
    setLoading(true)
    setError(null)
    try {
      const data = await todoApi.getTodos(APP_USERNAME)
      if (fetchId !== fetchIdRef.current) return   // stale — discard
      setTodos(data)
    } catch (err) {
      if (fetchId !== fetchIdRef.current) return
      setError(normalizeError(err))
    } finally {
      if (fetchId === fetchIdRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTodos()
    // Cancel in-flight on unmount by bumping the counter so any pending
    // response knows it is stale.
    return () => { fetchIdRef.current++ }
  }, [fetchTodos, refreshTrigger])

  // ── delete ───────────────────────────────────────────────────────────────

  async function handleDelete(id) {
    // Normalise to string to match storage keys (guard against numeric IDs).
    const sid = String(id)
    setDeleteState((prev) => ({ ...prev, [sid]: 'deleting' }))
    try {
      await todoApi.deleteTodo(APP_USERNAME, sid)
      // Show success message first (row stays visible), then remove after TTL.
      // This ensures the "✓ Deleted" badge is rendered before the row disappears.
      setDeleteState((prev) => ({ ...prev, [sid]: 'success' }))
      setTimeout(() => {
        setTodos((prev) => prev.filter((t) => String(t.id) !== sid))
        setDeleteState((prev) => {
          const next = { ...prev }
          delete next[sid]
          return next
        })
      }, DELETE_SUCCESS_TTL)
    } catch (err) {
      setDeleteState((prev) => ({ ...prev, [sid]: normalizeError(err) }))
    }
  }

  function clearDeleteError(id) {
    const sid = String(id)
    setDeleteState((prev) => {
      const next = { ...prev }
      delete next[sid]
      return next
    })
  }

  async function handleToggleDone(todo) {
    try {
      const updated = await todoApi.updateTodo(APP_USERNAME, todo.id, { done: !todo.done })
      setTodos((prev) => prev.map((t) => (String(t.id) === String(updated.id) ? updated : t)))
    } catch (err) {
      setError(normalizeError(err))
    }
  }

  // ── render states ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <p
        className="status-msg"
        data-testid="todos-loading"
        role="status"
        aria-live="polite"
      >
        ⏳ Loading todos…
      </p>
    )
  }

  if (error) {
    return (
      <ErrorBanner
        message={error}
        onRetry={fetchTodos}
        testId="todos-error-banner"
      />
    )
  }

  if (todos.length === 0) {
    return (
      <div
        className="empty-state"
        data-testid="todos-empty"
        role="status"
        aria-live="polite"
      >
        <p>No todos yet — get started!</p>
        <button
          className="btn btn--primary"
          data-testid="todos-add"
          onClick={() => onEdit(null)}
        >
          + Add your first todo
        </button>
      </div>
    )
  }

  return (
    <div>
      <table className="todo-table" data-testid="todos-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Target Date</th>
            <th>Done</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {todos.map((todo) => {
            const sid          = String(todo.id)
            const ds           = deleteState[sid]
            const isDeleting   = ds === 'deleting'
            const isSuccess    = ds === 'success'
            const deleteError  = ds && ds !== 'deleting' && ds !== 'success' ? ds : null

            return (
              <tr
                key={sid}
                data-testid={`todo-row-${sid}`}
                className={todo.done ? 'todo-row--done' : ''}
              >
                <td>
                  <span className={todo.done ? 'todo-text--done' : ''}>
                    {todo.description}
                  </span>
                  {isSuccess && (
                    <span className="delete-success" role="status" aria-live="polite">
                      {' '}✓ Deleted
                    </span>
                  )}
                  {deleteError && (
                    <span
                      className="delete-error"
                      data-testid={`todo-delete-error-${sid}`}
                      role="alert"
                    >
                      {' '}⚠ {deleteError}{' '}
                      <button
                        className="btn-link"
                        onClick={() => clearDeleteError(sid)}
                      >
                        dismiss
                      </button>
                    </span>
                  )}
                </td>
                <td>{todo.targetDate}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => handleToggleDone(todo)}
                    aria-label={`Mark "${todo.description}" as ${todo.done ? 'incomplete' : 'done'}`}
                  />
                </td>
                <td className="actions-cell">
                  <button
                    className="btn btn--small"
                    onClick={() => onEdit(todo)}
                    disabled={isDeleting}
                    data-testid={`todo-edit-${sid}`}
                  >
                    Edit
                  </button>
                  <button
                    className={`btn btn--small btn--danger${isDeleting ? ' btn--loading' : ''}`}
                    onClick={() => handleDelete(sid)}
                    disabled={isDeleting}
                    data-testid={isDeleting ? `todo-deleting-${sid}` : `todo-delete-${sid}`}
                    aria-label={isDeleting ? 'Deleting…' : `Delete "${todo.description}"`}
                  >
                    {isDeleting ? '…' : '×'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ListTodosComponent
