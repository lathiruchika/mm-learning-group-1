// TodoComponent — Add / Edit todo form with load, save, and error states.
// EPMCDMETST-70451: load spinner when fetching existing todo, save-in-progress
// disable, friendly error banner on failure, values retained on error.

import { useState, useEffect } from 'react'
import { todoApi } from '../api/todoApiFactory.js'
import { normalizeError } from '../api/errorNormalizer.js'
import { APP_USERNAME } from '../config/apiConfig.js'
import ErrorBanner from './ErrorBanner.jsx'

const EMPTY_FORM = { description: '', targetDate: '', done: false }

function TodoComponent({ editTodo, onSaved, onCancel }) {
  const isEditing = Boolean(editTodo)

  const [form, setForm]       = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)   // fetching existing todo
  const [saving, setSaving]   = useState(false)   // save in progress
  const [error, setError]     = useState(null)    // save/load error
  const [errors, setErrors]   = useState({})      // field-level validation

  // When editTodo changes, pre-fill form (or reset for add mode).
  useEffect(() => {
    if (!editTodo) {
      setForm(EMPTY_FORM)
      setError(null)
      setErrors({})
      return
    }
    // If the parent passed full data, use it directly.
    // If only an id was passed, fetch from API.
    if (editTodo.description !== undefined) {
      setForm({
        description: editTodo.description,
        targetDate: editTodo.targetDate ?? '',
        done: editTodo.done ?? false,
      })
    } else {
      loadTodo(editTodo.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTodo?.id])

  async function loadTodo(id) {
    setLoading(true)
    setError(null)
    try {
      const data = await todoApi.getTodo(APP_USERNAME, id)
      setForm({ description: data.description, targetDate: data.targetDate, done: data.done })
    } catch (err) {
      setError(normalizeError(err))
    } finally {
      setLoading(false)
    }
  }

  function validate() {
    const errs = {}
    if (!form.description || form.description.trim().length < 8) {
      errs.description = 'Description must be at least 8 characters.'
    }
    if (!form.targetDate) {
      errs.targetDate = 'Target date is required.'
    }
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setSaving(true)
    setError(null)
    try {
      let saved
      if (isEditing) {
        saved = await todoApi.updateTodo(APP_USERNAME, editTodo.id, {
          description: form.description.trim(),
          targetDate: form.targetDate,
          done: form.done,
        })
      } else {
        saved = await todoApi.createTodo(APP_USERNAME, {
          description: form.description.trim(),
          targetDate: form.targetDate,
        })
      }
      onSaved(saved)
      if (!isEditing) setForm(EMPTY_FORM)
    } catch (err) {
      // Values are intentionally retained on error so the user doesn't lose work.
      setError(normalizeError(err))
    } finally {
      setSaving(false)
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  // ── render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <p className="status-msg" data-testid="todoform-loading">
        ⏳ Loading todo…
      </p>
    )
  }

  return (
    <form
      className="todo-form"
      id="add-todo"
      onSubmit={handleSubmit}
      noValidate
      data-testid="todo-form"
    >
      <h2 className="todo-form__title">
        {isEditing ? `Edit Todo #${editTodo.id}` : 'Add Todo'}
      </h2>

      <ErrorBanner
        message={error}
        testId="todoform-error-banner"
      />

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description <span className="required">*</span>
        </label>
        <input
          id="description"
          name="description"
          type="text"
          className={`form-input${errors.description ? ' form-input--error' : ''}`}
          value={form.description}
          onChange={handleChange}
          disabled={saving}
          placeholder="At least 8 characters"
          data-testid="todoform-description"
          aria-describedby="description-error"
        />
        {errors.description && (
          <p id="description-error" className="field-error" data-testid="todoform-description-error">
            {errors.description}
          </p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="targetDate" className="form-label">
          Target Date <span className="required">*</span>
        </label>
        <input
          id="targetDate"
          name="targetDate"
          type="date"
          className={`form-input${errors.targetDate ? ' form-input--error' : ''}`}
          value={form.targetDate}
          onChange={handleChange}
          disabled={saving}
          data-testid="todoform-target-date"
          aria-describedby="targetDate-error"
        />
        {errors.targetDate && (
          <p id="targetDate-error" className="field-error" data-testid="todoform-target-date-error">
            {errors.targetDate}
          </p>
        )}
      </div>

      {isEditing && (
        <div className="form-group form-group--inline">
          <label className="form-label">
            <input
              name="done"
              type="checkbox"
              checked={form.done}
              onChange={handleChange}
              disabled={saving}
              data-testid="todoform-done"
            />
            {' '}Mark as done
          </label>
        </div>
      )}

      <div className="form-actions">
        <button
          type="submit"
          className={`btn btn--primary${saving ? ' btn--loading' : ''}`}
          disabled={saving}
          data-testid={saving ? 'todoform-saving' : 'todoform-submit'}
        >
          {saving ? 'Saving…' : isEditing ? 'Update' : 'Add Todo'}
        </button>
        {isEditing && (
          <button
            type="button"
            className="btn"
            onClick={onCancel}
            disabled={saving}
            data-testid="todoform-cancel"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default TodoComponent
