import { useState } from 'react'

// A single todo row: done checkbox, description, target date, inline edit, and
// delete. Inline edit keeps the single-page app without needing a router.
function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.description)

  async function saveEdit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== todo.description) {
      await onEdit(todo.id, trimmed)
    }
    setEditing(false)
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
          <input
            type="text"
            className="edit-input"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
            data-testid={`todo-edit-input-${todo.id}`}
          />
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
            onClick={() => {
              setDraft(todo.description)
              setEditing(true)
            }}
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
