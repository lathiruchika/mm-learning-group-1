// ListTodosComponent — displays todos with loading, empty, and error states.
// Handles per-row delete progress + delete error (EPMCDMETST-70449, 70450).

import { useState, useEffect } from 'react'
import { todoApi } from '../api/todoApiFactory.js'
import { normalizeError } from '../api/errorNormalizer.js'
import { APP_USERNAME } from '../config/apiConfig.js'
import ErrorBanner from './ErrorBanner.jsx'

function ListTodosComponent({ onEdit, refreshTrigger }) {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Track per-row delete state: { [id]: 'deleting' | 'error' | string }
  const [deleteState, setDeleteState] = useState({})

  async function fetchTodos() {
    setLoading(true)
    setError(null)
    try {
      const data = await todoApi.getTodos(APP_USERNAME)
      setTodos(data)
    } catch (err) {
      setError(normalizeError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger])

  async function handleDelete(id) {
    setDeleteState((prev) => ({ ...prev, [id]: 'deleting' }))
    try {
      await todoApi.deleteTodo(APP_USERNAME, id)
      setTodos((prev) => prev.filter((t) => t.id !== id))
      setDeleteState((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } catch (err) {
      setDeleteState((prev) => ({ ...prev, [id]: normalizeError(err) }))
    }
  }

  function clearDeleteError(id) {
    setDeleteState((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  async function handleToggleDone(todo) {
    try {
      const updated = await todoApi.updateTodo(APP_USERNAME, todo.id, { done: !todo.done })
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } catch (err) {
      setError(normalizeError(err))
    }
  }

  // ── render states ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <p className="status-msg" data-testid="todos-loading">
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
      <div className="empty-state" data-testid="todos-empty">
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
            const ds = deleteState[todo.id]
            const isDeleting = ds === 'deleting'
            const deleteError = ds && ds !== 'deleting' ? ds : null

            return (
              <tr
                key={todo.id}
                data-testid={`todo-row-${todo.id}`}
                className={todo.done ? 'todo-row--done' : ''}
              >
                <td>
                  <span
                    className={todo.done ? 'todo-text--done' : ''}
                  >
                    {todo.description}
                  </span>
                  {deleteError && (
                    <span
                      className="delete-error"
                      data-testid={`todo-delete-error-${todo.id}`}
                    >
                      {' '}⚠ {deleteError}{' '}
                      <button
                        className="btn-link"
                        onClick={() => clearDeleteError(todo.id)}
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
                    data-testid={`todo-edit-${todo.id}`}
                  >
                    Edit
                  </button>
                  <button
                    className={`btn btn--small btn--danger${isDeleting ? ' btn--loading' : ''}`}
                    onClick={() => handleDelete(todo.id)}
                    disabled={isDeleting}
                    data-testid={isDeleting ? `todo-deleting-${todo.id}` : `todo-delete-${todo.id}`}
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
