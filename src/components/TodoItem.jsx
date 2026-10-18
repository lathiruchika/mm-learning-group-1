// A single todo row: toggle checkbox, text, and delete button.
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li
      className={`todo-item ${todo.completed ? 'completed' : ''}`}
      data-testid={`todo-row-${todo.id}`}
    >
      <label>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          data-testid={`todo-toggle-${todo.id}`}
        />
        <span className="todo-text">{todo.text}</span>
      </label>
      <button
        className="delete-btn"
        onClick={() => onDelete(todo.id)}
        aria-label="Delete todo"
        data-testid={`todo-delete-${todo.id}`}
      >
        ×
      </button>
    </li>
  )
}

export default TodoItem
