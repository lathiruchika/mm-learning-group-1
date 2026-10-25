import { useState } from 'react'
import { hasErrors, validateTodo } from './validation.js'

// Controlled inputs + submit handler for creating a new todo. Doubles as the
// "todo editor" surface for this single-page app (create only).
function AddTodoForm({ onAdd, formError }) {
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [touched, setTouched] = useState({ description: false, targetDate: false })
  const [saving, setSaving] = useState(false)

  const errors = validateTodo({ description, targetDate })
  const invalid = hasErrors(errors)

  function touch(field) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    // Guards double submit (Enter key, rapid clicks) as well as invalid input.
    if (saving) return
    if (invalid) {
      setTouched({ description: true, targetDate: true })
      return
    }
    setSaving(true)
    try {
      const ok = await onAdd({ description: description.trim(), targetDate })
      if (ok) {
        setDescription('')
        setTargetDate('')
        setTouched({ description: false, targetDate: false })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      className="add-form"
      onSubmit={handleSubmit}
      noValidate
      data-testid="todo-editor-page"
    >
      <div className="add-form-row">
        <input
          type="text"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value)
            touch('description')
          }}
          onBlur={() => touch('description')}
          placeholder="What needs to be done?"
          aria-label="Description"
          aria-invalid={touched.description && Boolean(errors.description)}
          disabled={saving}
          data-testid="todo-description-input"
        />
        <input
          type="date"
          value={targetDate}
          onChange={(e) => {
            setTargetDate(e.target.value)
            touch('targetDate')
          }}
          onBlur={() => touch('targetDate')}
          aria-label="Target date"
          aria-invalid={touched.targetDate && Boolean(errors.targetDate)}
          disabled={saving}
          data-testid="todo-targetDate-input"
        />
        <button
          type="submit"
          disabled={invalid || saving}
          data-testid="todo-add-btn"
        >
          {saving ? 'Saving…' : 'Add'}
        </button>
      </div>
      {touched.description && errors.description && (
        <p className="form-error" data-testid="todo-description-error">
          {errors.description}
        </p>
      )}
      {touched.targetDate && errors.targetDate && (
        <p className="form-error" data-testid="todo-targetDate-error">
          {errors.targetDate}
        </p>
      )}
      {formError && (
        <p className="form-error" role="alert" data-testid="todo-form-error">
          {formError}
        </p>
      )}
    </form>
  )
}

export default AddTodoForm
