import { useState } from 'react'
import ApiModeBadge from './components/ApiModeBadge.jsx'
import ListTodosComponent from './components/ListTodosComponent.jsx'
import TodoComponent from './components/TodoComponent.jsx'

function App() {
  // editTodo: null = add mode, todo object = edit mode
  const [editTodo, setEditTodo] = useState(null)
  // Increment to signal ListTodosComponent to re-fetch after a save.
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  function handleEdit(todo) {
    setEditTodo(todo)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSaved() {
    setEditTodo(null)
    setRefreshTrigger((n) => n + 1)
  }

  function handleCancel() {
    setEditTodo(null)
  }

  return (
    <div className="app">
      <header className="app-header" data-testid="app-navbar">
        <h1 className="app-title">📝 Todo App</h1>
        <ApiModeBadge />
      </header>

      <main className="app-main">
        <section className="form-section">
          <TodoComponent
            editTodo={editTodo}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        </section>

        <section className="list-section">
          <h2 className="section-title">My Todos</h2>
          <ListTodosComponent
            onEdit={handleEdit}
            refreshTrigger={refreshTrigger}
          />
        </section>
      </main>
    </div>
  )
}

export default App
