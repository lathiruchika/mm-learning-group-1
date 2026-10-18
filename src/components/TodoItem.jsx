// A single todo row: toggle checkbox, text, and delete button.
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <label>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <span className="todo-text">{todo.text}</span>
      </label>
      <button
        className="delete-btn"
        onClick={() => onDelete(todo.id)}
        aria-label="Delete todo"
      >
        ×
      </button>
    </li>
  )
}

export default TodoItem
