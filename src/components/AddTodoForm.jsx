import { useState } from 'react'

// Controlled input + submit handler for creating a new todo.
function AddTodoForm({ onAdd }) {
  const [text, setText] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onAdd(text)
    setText('')
  }

  return (
    <form className="add-form" onSubmit={handleSubmit} data-testid="todo-form">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs to be done?"
        aria-label="New todo"
        data-testid="todo-description"
      />
      <button type="submit" data-testid="todo-create">
        Add
      </button>
    </form>
  )
}

export default AddTodoForm
