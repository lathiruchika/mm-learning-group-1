import { useEffect, useState } from 'react'
import AddTodoForm from './components/AddTodoForm.jsx'
import TodoList from './components/TodoList.jsx'

const STORAGE_KEY = 'todos'

// Load any previously saved todos from localStorage (runs once on first render).
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function App() {
  const [todos, setTodos] = useState(loadTodos)

  // Persist todos whenever they change.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  function addTodo(text) {
    const trimmed = text.trim()
    if (!trimmed) return
    const todo = { id: crypto.randomUUID(), text: trimmed, completed: false }
    setTodos((prev) => [todo, ...prev])
  }

  function toggleTodo(id) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <main className="app">
      <h1>Todos</h1>
      <AddTodoForm onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
    </main>
  )
}

export default App
