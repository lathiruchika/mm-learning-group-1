// Shared test helpers for dummy-API todo app e2e tests.

export const SCHEMA_VERSION = 1

/** Seed todos into localStorage before navigating. */
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

/** Clear localStorage so the app re-seeds on next load. */
export async function clearStorage(page) {
  await page.addInitScript(() => {
    localStorage.clear()
  })
}

/** Stub VITE_ env vars at runtime via window.__VITE_ENV_OVERRIDE__ pattern.
 *  Because Vite bakes env at dev-start, we override by monkey-patching
 *  import.meta.env properties via addInitScript before the module loads.
 */
export async function overrideEnv(page, vars) {
  await page.addInitScript((envVars) => {
    // Patch import.meta.env values before app modules evaluate.
    Object.defineProperty(window, '__pw_env_patch__', { value: envVars })
    // Store for use by the app module shim.
    for (const [k, v] of Object.entries(envVars)) {
      sessionStorage.setItem(`__pw_env_${k}`, v)
    }
  }, vars)
}

export const DEFAULT_TODOS = [
  { id: '1', username: 'demo-user', description: 'Buy groceries for the week', targetDate: '2026-11-05', done: false },
  { id: '2', username: 'demo-user', description: 'Finish capstone frontend implementation', targetDate: '2026-11-10', done: false },
  { id: '3', username: 'demo-user', description: 'Review pull request for dummy API layer', targetDate: '2026-11-03', done: true },
]
