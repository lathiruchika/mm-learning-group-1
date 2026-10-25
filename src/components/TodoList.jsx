import { useMemo, useState } from 'react'
import TodoItem from './TodoItem.jsx'
import {
  DEFAULT_VIEW,
  SORT_DATE_ASC,
  SORT_DATE_DESC,
  SORT_NONE,
  STATUS_ALL,
  STATUS_DONE,
  STATUS_NOT_DONE,
  applySearchFilterSort,
  isViewActive,
} from './listUtils.js'

// Renders search/filter/sort controls and the resulting list of todos. The view
// state is local and purely client-side; the full list is never mutated.
function TodoList({ todos, onToggle, onEdit, onDelete }) {
  const [view, setView] = useState(DEFAULT_VIEW)

  const visibleTodos = useMemo(() => applySearchFilterSort(todos, view), [todos, view])

  function updateView(patch) {
    setView((prev) => ({ ...prev, ...patch }))
  }

  // Nothing to search, filter or sort yet.
  if (todos.length === 0) {
    return (
      <p className="empty" data-testid="todos-empty">
        No todos yet. Add one above.
      </p>
    )
  }

  return (
    <>
      <div className="list-controls" data-testid="todo-list-controls">
        <input
          type="search"
          value={view.search}
          onChange={(e) => updateView({ search: e.target.value })}
          placeholder="Search todos"
          aria-label="Search todos"
          data-testid="todo-search-input"
        />
        <select
          value={view.status}
          onChange={(e) => updateView({ status: e.target.value })}
          aria-label="Filter by status"
          data-testid="todo-status-filter"
        >
          <option value={STATUS_ALL}>All</option>
          <option value={STATUS_DONE}>Done</option>
          <option value={STATUS_NOT_DONE}>Not done</option>
        </select>
        <select
          value={view.sort}
          onChange={(e) => updateView({ sort: e.target.value })}
          aria-label="Sort by target date"
          data-testid="todo-sort-select"
        >
          <option value={SORT_NONE}>Sort: default</option>
          <option value={SORT_DATE_ASC}>Date: earliest first</option>
          <option value={SORT_DATE_DESC}>Date: latest first</option>
        </select>
        {isViewActive(view) && (
          <button
            type="button"
            className="clear-btn"
            onClick={() => setView(DEFAULT_VIEW)}
            data-testid="todo-clear-filters-btn"
          >
            Clear
          </button>
        )}
      </div>

      {visibleTodos.length === 0 ? (
        <p className="empty" data-testid="todos-empty">
          No todos match your filters.
        </p>
      ) : (
        <ul className="todo-list" data-testid="todos-table">
          {visibleTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </>
  )
}

export default TodoList
