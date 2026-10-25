// Pure validation for todo input, shared by the add form and the inline editor.

export const MIN_DESCRIPTION_LENGTH = 8

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

function pad(n) {
  return String(n).padStart(2, '0')
}

// Local calendar date as yyyy-MM-dd (not UTC, so "today" matches the user's day).
export function toIsoDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// True only for real calendar dates: rejects 2026-02-31 and 2026-13-01.
function isRealDate(value) {
  const match = DATE_RE.exec(value)
  if (!match) return false
  const [, y, m, d] = match.map(Number)
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}

export function validateDescription(description) {
  const trimmed = (description ?? '').trim()
  if (!trimmed) return 'Description is required'
  if (trimmed.length < MIN_DESCRIPTION_LENGTH) {
    return `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`
  }
  return null
}

// Target date is optional; when present it must be a real date, today or later.
export function validateTargetDate(targetDate, today = new Date()) {
  const value = (targetDate ?? '').trim()
  if (!value) return null
  if (!isRealDate(value)) return 'Target date must be a valid date'
  if (value < toIsoDate(today)) return 'Target date cannot be in the past'
  return null
}

// Returns { description, targetDate } where each is an error message or null.
export function validateTodo({ description, targetDate }, today = new Date()) {
  return {
    description: validateDescription(description),
    targetDate: validateTargetDate(targetDate, today),
  }
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean)
}
