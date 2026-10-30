import { test as base, expect } from '@playwright/test'

export const USERNAME = 'darshan'
export const PASSWORD = 'dummy'
export const SIMULATE_KEY = 'dummy-api:simulate-error'

// Extends the base test with `backendRequests`: every request the page makes to
// the old backend (localhost:8080). Scenarios assert it stays empty.
export const test = base.extend({
  backendRequests: async ({ page }, use) => {
    const seen = []
    page.on('request', (request) => {
      if (/^https?:\/\/(localhost|127\.0\.0\.1):8080(\/|$)/.test(request.url())) {
        seen.push(request.url())
      }
    })
    await use(seen)
  },
})

export { expect }

// Login is held in React state only (no session persistence), so every full page
// load starts logged out and a protected route must be reached by in-app navigation.

/** Open the login page. Same origin as the app, so localStorage can be seeded afterwards. */
export async function openLogin(page) {
  await page.goto('/')
  await expect(page.locator('input[name="username"]')).toBeVisible()
}

/** Fill the login form (selectors come from Login.jsx: no test ids exist) and submit. */
export async function signIn(page, username = USERNAME, password = PASSWORD) {
  await page.locator('input[name="username"]').fill(username)
  await page.locator('input[name="password"]').fill(password)
  await page.getByRole('button', { name: 'Login' }).click()
}

/** Navigate to the todo list through the header link (in-app, keeps the session). */
export async function openTodoList(page) {
  await page.getByRole('link', { name: 'Yours Todo Lists' }).click()
  await expect(page).toHaveURL(/\/list-todos$/)
}

/** Seed localStorage entries. Values are stored as given (strings) or JSON-encoded (objects). */
export async function seedStorage(page, entries) {
  await page.evaluate((items) => {
    for (const [key, value] of Object.entries(items)) {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    }
  }, entries)
}

export async function readStorage(page, key) {
  return page.evaluate((k) => localStorage.getItem(k), key)
}

export async function readJson(page, key) {
  const raw = await readStorage(page, key)
  return raw === null ? null : JSON.parse(raw)
}

export async function setSimulatedErrors(page, enabled) {
  await page.evaluate(
    ([key, on]) => {
      if (on) localStorage.setItem(key, '1')
      else localStorage.removeItem(key)
    },
    [SIMULATE_KEY, enabled],
  )
}

/**
 * Start from a clean browser context: load the app, optionally seed storage,
 * log in. Ends on the welcome page, NOT on the list, so loading states stay observable.
 */
export async function startSession(page, storage = {}) {
  await openLogin(page)
  if (Object.keys(storage).length) await seedStorage(page, storage)
  await signIn(page)
  await expect(page).toHaveURL(/\/welcome\/darshan$/)
}

/** startSession + open the list and wait until loading has finished. */
export async function startOnList(page, storage = {}) {
  await startSession(page, storage)
  await openTodoList(page)
  await expect(page.getByTestId('todo-list-loading')).toBeHidden()
}

/**
 * Client-side navigation to an arbitrary route. A full page load would lose the
 * in-memory login, so push history and let react-router pick up the popstate.
 */
export async function navigateInApp(page, path) {
  await page.evaluate((to) => {
    window.history.pushState({}, '', to)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, path)
}

export const todoRows = (page) => page.getByTestId(/^todo-row-\d+$/)
export const rowWithText = (page, text) => todoRows(page).filter({ hasText: text })

/** Fill the todo form. Fields left undefined are untouched. */
export async function fillTodoForm(page, { description, targetDate, done } = {}) {
  if (description !== undefined) await page.getByTestId('todo-field-description').fill(description)
  if (targetDate !== undefined) await page.getByTestId('todo-field-targetDate').fill(targetDate)
  if (done !== undefined) await page.getByTestId('todo-field-done').setChecked(done)
}

/** From the list: open the create form, fill it and save; ends back on the list. */
export async function createTodo(page, todo) {
  await page.getByTestId('todo-add-cta').click()
  await expect(page.getByTestId('todo-form')).toBeVisible()
  await fillTodoForm(page, todo)
  await expect(page.getByTestId('todo-save')).toBeEnabled()
  await page.getByTestId('todo-save').click()
  await expect(page).toHaveURL(/\/list-todos$/)
  await expect(page.getByTestId('todo-list-loading')).toBeHidden()
}

export const seedTodos = [
  { id: 1, description: 'Learn React fundamentals', done: false, targetDate: '2030-01-10' },
  { id: 2, description: 'Build the todo frontend', done: false, targetDate: '2030-01-20' },
  { id: 3, description: 'Write project documentation', done: true, targetDate: '2029-12-01' },
]

/** Full page reload (drops the in-memory login), sign in again and open the list. */
export async function reloadAndOpenList(page) {
  await page.reload()
  await expect(page.locator('input[name="username"]')).toBeVisible()
  await signIn(page)
  await openTodoList(page)
  await expect(page.getByTestId('todo-list-loading')).toBeHidden()
}

/** Ids currently stored for a user, in storage order. */
export async function storedIds(page, username = USERNAME) {
  const stored = await readJson(page, `todo:${username}`)
  return stored.map((t) => t.id)
}

/**
 * Count dummy API calls. Every adapter call reads the simulate-error flag exactly once
 * (after its delay), so reads of that key are a faithful call counter that does not
 * touch application code. Register BEFORE the first navigation (addInitScript).
 * Read the counter with `apiCallCount(page)`; reset it with `resetApiCallCount(page)`.
 */
export async function installApiCallCounter(page) {
  await page.addInitScript((key) => {
    window.__apiCalls = 0
    const original = Storage.prototype.getItem
    Storage.prototype.getItem = function (name) {
      if (name === key) window.__apiCalls += 1
      return original.call(this, name)
    }
  }, SIMULATE_KEY)
}

export const apiCallCount = (page) => page.evaluate(() => window.__apiCalls)
export const resetApiCallCount = (page) =>
  page.evaluate(() => {
    window.__apiCalls = 0
  })

/** The id part of a row's data-testid (todo-row-12 -> 12). */
export async function rowId(row) {
  return (await row.getAttribute('data-testid')).replace('todo-row-', '')
}
