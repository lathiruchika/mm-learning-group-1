// Shared test helpers for dummy-API todo app e2e tests.

export const SCHEMA_VERSION = 1

/**
 * Seed todos into localStorage before navigating.
 * Uses addInitScript — runs on EVERY page load (incl. reload).
 * Use only when the test does NOT call page.reload() afterwards,
 * or when you want the seed to be re-applied on reload.
 */
export async function seedTodos(page, todos) {
  const meta = {
    nextId: 200,
    seededAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
  }
  await page.addInitScript(({ todosJson, metaJson }) => {
    localStorage.setItem('mm.todos.v1', todosJson)
    localStorage.setItem('mm.todos.meta.v1', metaJson)
  }, { todosJson: JSON.stringify(todos), metaJson: JSON.stringify(meta) })
}

/**
 * Navigate to the app, clear localStorage via evaluate (NOT addInitScript),
 * then reload so the app picks up a fresh state and re-seeds defaults.
 *
 * Safe for persist-after-reload tests: subsequent page.reload() calls will NOT
 * re-clear storage because we used evaluate, not addInitScript.
 */
export async function resetStorage(page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
}

export const DEFAULT_TODOS = [
  { id: '1', username: 'demo-user', description: 'Buy groceries for the week', targetDate: '2026-11-05', done: false },
  { id: '2', username: 'demo-user', description: 'Finish capstone frontend implementation', targetDate: '2026-11-10', done: false },
  { id: '3', username: 'demo-user', description: 'Review pull request for dummy API layer', targetDate: '2026-11-03', done: true },
]
