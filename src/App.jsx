import { useEffect, useState } from 'react'
import AddTodoForm from './components/AddTodoForm.jsx'
import TodoList from './components/TodoList.jsx'
import { todoService, DEMO_USER } from './services/todo/index.js'

function App() {
  const [todos, setTodos] = useState([])

  // Load todos through the service on mount (mock mode needs no backend).
  useEffect(() => {
    let active = true
    todoService.listTodos(DEMO_USER).then((items) => {
      if (active) setTodos(items)
    })
    return () => {
      active = false
    }
  }, [])

  async function addTodo(text) {
    const trimmed = text.trim()
    if (!trimmed) return
    const created = await todoService.createTodo(DEMO_USER, { text: trimmed })
    setTodos((prev) => [created, ...prev])
  }

  async function toggleTodo(id) {
    const current = todos.find((t) => t.id === id)
    if (!current) return
    const updated = await todoService.updateTodo(DEMO_USER, id, {
      completed: !current.completed,
    })
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }

  async function deleteTodo(id) {
    await todoService.deleteTodo(DEMO_USER, id)
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <main className="app" data-testid="todos-page">
      <h1>Todos</h1>
      <AddTodoForm onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
    </main>
  )
}

export default App
