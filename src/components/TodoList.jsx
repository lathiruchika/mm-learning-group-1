import TodoItem from './TodoItem.jsx'

// Renders the list of todos, or an empty-state message.
function TodoList({ todos, onToggle, onEdit, onDelete }) {
  if (todos.length === 0) {
    return (
      <p className="empty" data-testid="todos-empty">
        No todos yet. Add one above.
      </p>
    )
  }

  return (
    <ul className="todo-list" data-testid="todos-table">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}

export default TodoList
