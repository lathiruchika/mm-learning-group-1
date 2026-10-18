import { useCallback, useEffect, useState } from 'react'
import AddTodoForm from './components/AddTodoForm.jsx'
import TodoList from './components/TodoList.jsx'
import { todoApi } from './api/apiAdapter.js'

// This app has no login screen, so we scope todos to a fixed demo user.
// It matches the username seeded by the dummy provider.
const USERNAME = 'darshan'

function messageOf(err) {
  return err?.message || 'Something went wrong'
}

function App() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)

  // Load the list through the adapter. In dummy mode this touches no network.
  const loadTodos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await todoApi.listTodos(USERNAME)
      setTodos(list)
    } catch (err) {
      setError(messageOf(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  // Returns true on success so the form can reset itself.
  async function addTodo({ description, targetDate }) {
    setFormError(null)
    try {
      const created = await todoApi.createTodo(USERNAME, {
        description,
        targetDate,
        done: false,
      })
      setTodos((prev) => [...prev, created])
      return true
    } catch (err) {
      setFormError(messageOf(err))
      return false
    }
  }

  async function toggleTodo(id) {
    const current = todos.find((t) => t.id === id)
    if (!current) return
    try {
      const updated = await todoApi.updateTodo(USERNAME, id, {
        ...current,
        done: !current.done,
      })
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (err) {
      setError(messageOf(err))
    }
  }

  async function editTodo(id, description) {
    const current = todos.find((t) => t.id === id)
    if (!current) return
    const updated = await todoApi.updateTodo(USERNAME, id, {
      ...current,
      description,
    })
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }

  async function deleteTodo(id) {
    try {
      await todoApi.deleteTodo(USERNAME, id)
      setTodos((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      setError(messageOf(err))
    }
  }

  return (
    <main className="app" data-testid="todos-page">
      <h1>Todos</h1>

      <AddTodoForm onAdd={addTodo} formError={formError} />

      {loading ? (
        <p className="loading" data-testid="todos-loading">
          Loading todos…
        </p>
      ) : error ? (
        <div className="error-banner" data-testid="todos-error">
          <span>{error}</span>
          <button type="button" data-testid="todos-retry-btn" onClick={loadTodos}>
            Retry
          </button>
        </div>
      ) : (
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onEdit={editTodo}
          onDelete={deleteTodo}
        />
      )}
    </main>
  )
}

export default App
