import { useState } from 'react'
import { validateDescription } from './validation.js'

// A single todo row: done checkbox, description, target date, inline edit, and
// delete. Inline edit keeps the single-page app without needing a router.
function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.description)
  const [editError, setEditError] = useState(null)
  const [saving, setSaving] = useState(false)

  function startEdit() {
    setDraft(todo.description)
    setEditError(null)
    setEditing(true)
  }

  function cancelEdit() {
    setEditError(null)
    setEditing(false)
  }

  async function saveEdit() {
    if (saving) return
    const trimmed = draft.trim()
    // Unchanged: just close. Existing todos may predate the length rule.
    if (trimmed === todo.description) {
      cancelEdit()
      return
    }
    const message = validateDescription(trimmed)
    if (message) {
      setEditError(message)
      return
    }
    setSaving(true)
    try {
      await onEdit(todo.id, trimmed)
      cancelEdit()
    } catch (err) {
      setEditError(err?.message || 'Could not save changes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <li
      className={`todo-item ${todo.done ? 'completed' : ''}`}
      data-testid={`todo-row-${todo.id}`}
    >
      <label>
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggle(todo.id)}
          data-testid={`todo-done-checkbox-${todo.id}`}
        />
        {editing ? (
          <span className="edit-field">
          <input
            type="text"
            className="edit-input"
            value={draft}
            autoFocus
            disabled={saving}
            aria-invalid={Boolean(editError)}
            onChange={(e) => {
              setDraft(e.target.value)
              setEditError(null)
            }}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit()
              if (e.key === 'Escape') cancelEdit()
            }}
            data-testid={`todo-edit-input-${todo.id}`}
          />
          {editError && (
            <small className="form-error" role="alert" data-testid={`todo-edit-error-${todo.id}`}>
              {editError}
            </small>
          )}
          </span>
        ) : (
          <span className="todo-text">
            {todo.description}
            {todo.targetDate && <small className="todo-date"> · {todo.targetDate}</small>}
          </span>
        )}
      </label>
      <div className="todo-actions">
        {!editing && (
          <button
            type="button"
            className="edit-btn"
            onClick={startEdit}
            aria-label="Edit todo"
            data-testid={`todo-edit-btn-${todo.id}`}
          >
            ✎
          </button>
        )}
        <button
          type="button"
          className="delete-btn"
          onClick={() => onDelete(todo.id)}
          aria-label="Delete todo"
          data-testid={`todo-delete-btn-${todo.id}`}
        >
          ×
        </button>
      </div>
    </li>
  )
}

export default TodoItem
