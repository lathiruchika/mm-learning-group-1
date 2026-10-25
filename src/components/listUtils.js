// Pure helpers for deriving the visible todo list from the full list.
// Kept separate from the component so the logic is easy to unit test.

export const STATUS_ALL = 'all'
export const STATUS_DONE = 'done'
export const STATUS_NOT_DONE = 'not-done'

export const SORT_NONE = 'none'
export const SORT_DATE_ASC = 'date-asc'
export const SORT_DATE_DESC = 'date-desc'

export const DEFAULT_VIEW = {
  search: '',
  status: STATUS_ALL,
  sort: SORT_NONE,
}

function matchesSearch(todo, search) {
  const needle = search.trim().toLowerCase()
  if (!needle) return true
  return (todo.description || '').toLowerCase().includes(needle)
}

function matchesStatus(todo, status) {
  if (status === STATUS_DONE) return todo.done
  if (status === STATUS_NOT_DONE) return !todo.done
  return true
}

// Todos without a target date always sort last, regardless of direction.
function compareByDate(direction) {
  return (a, b) => {
    if (!a.targetDate && !b.targetDate) return 0
    if (!a.targetDate) return 1
    if (!b.targetDate) return -1
    // ISO yyyy-MM-dd strings compare correctly as plain strings.
    const order = a.targetDate < b.targetDate ? -1 : a.targetDate > b.targetDate ? 1 : 0
    return direction === 'asc' ? order : -order
  }
}

export function applySearchFilterSort(todos, { search, status, sort } = DEFAULT_VIEW) {
  const visible = todos.filter(
    (todo) => matchesSearch(todo, search) && matchesStatus(todo, status),
  )
  if (sort === SORT_DATE_ASC) return [...visible].sort(compareByDate('asc'))
  if (sort === SORT_DATE_DESC) return [...visible].sort(compareByDate('desc'))
  return visible
}

export function isViewActive({ search, status, sort }) {
  return search.trim() !== '' || status !== STATUS_ALL || sort !== SORT_NONE
}
