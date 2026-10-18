import { useState } from 'react'

// Controlled inputs + submit handler for creating a new todo. Doubles as the
// "todo editor" surface for this single-page app (create only).
function AddTodoForm({ onAdd, formError }) {
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const ok = await onAdd({ description, targetDate })
    if (ok) {
      setDescription('')
      setTargetDate('')
    }
  }

  return (
    <form className="add-form" onSubmit={handleSubmit} data-testid="todo-editor-page">
      <div className="add-form-row">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What needs to be done?"
          aria-label="Description"
          data-testid="todo-description-input"
        />
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          aria-label="Target date"
          data-testid="todo-targetDate-input"
        />
        <button type="submit" data-testid="todo-add-btn">
          Add
        </button>
      </div>
      {formError && (
        <p className="form-error" data-testid="todo-form-error">
          {formError}
        </p>
      )}
    </form>
  )
}

export default AddTodoForm
