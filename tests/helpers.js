// Shared helpers for the todo specs.

const STORAGE_KEY = 'mm.todos.v1'

// Seed the dummy provider's localStorage document before the app loads. Only
// writes when nothing is stored yet, so a page reload keeps the app's own data.
export async function seedTodos(page, todos) {
  const doc = {
    schemaVersion: 1,
    nextId: todos.length + 1,
    todos: todos.map((todo, i) => ({
      id: i + 1,
      username: 'darshan',
      targetDate: '',
      done: false,
      ...todo,
    })),
  }
  await page.addInitScript(
    ({ key, value }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value))
    },
    { key: STORAGE_KEY, value: doc },
  )
}

export function rows(page) {
  return page.locator('[data-testid^="todo-row-"]')
}

// Descriptions in on-screen order (the target date shares the same span).
export async function visibleDescriptions(page) {
  const texts = await rows(page).locator('.todo-text').allTextContents()
  return texts.map((text) => text.split(' · ')[0].trim())
}

// Today as yyyy-MM-dd in the local timezone, matching the app's own rule.
export function todayIso() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
