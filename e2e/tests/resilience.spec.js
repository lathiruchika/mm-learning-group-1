import {
  test,
  expect,
  startSession,
  startOnList,
  openTodoList,
  createTodo,
  fillTodoForm,
  reloadAndOpenList,
  setSimulatedErrors,
  readStorage,
  rowWithText,
  todoRows,
  SIMULATE_KEY,
} from '../support/app.js'

// Mirrors e2e/features/resilience.feature (EPMCDMETST-70470).

const listBanner = (page) => page.getByTestId('todo-list-error-banner')
const formBanner = (page) => page.getByTestId('todo-form-error-banner')
const deleteBanner = (page) => page.getByTestId('todo-delete-error-banner')
const storageWarning = (page) => page.getByTestId('todo-storage-warning')

/** window.localStorage throws SecurityError on access, like a browser with storage blocked. */
async function blockLocalStorage(page) {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('The operation is insecure.', 'SecurityError')
      },
    })
  })
}

/** Every Storage.setItem throws QuotaExceededError while window.__quotaFull is true. */
async function installQuotaSwitch(page) {
  await page.addInitScript(() => {
    window.__quotaFull = false
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (window.__quotaFull) {
        throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
      }
      return original.call(this, key, value)
    }
  })
}

const setStorageFull = (page, full) =>
  page.evaluate((value) => {
    window.__quotaFull = value
  }, full)

async function openFilledCreateForm(page) {
  await page.getByTestId('todo-add-cta').click()
  await expect(page.getByTestId('todo-form')).toBeVisible()
  await fillTodoForm(page, { description: 'Save into a full store', targetDate: '2030-09-09' })
  await expect(page.getByTestId('todo-save')).toBeEnabled()
}

test.describe('Feature: Simulated errors and browser storage problems', () => {
  test.describe('Rule: Simulated API errors', () => {
    test('Scenario: The list error banner disappears as soon as Retry is clicked', async ({ page }) => {
      await startSession(page, { [SIMULATE_KEY]: '1' })
      await openTodoList(page)
      await expect(listBanner(page)).toBeVisible()

      await page.getByTestId('todo-list-retry').click()

      // The banner is cleared at the click, while the new request is still running.
      await expect(page.getByTestId('todo-list-loading')).toBeVisible()
      await expect(listBanner(page)).toHaveCount(0)

      // The failure persists, so the banner returns once loading has finished.
      await expect(page.getByTestId('todo-list-loading')).toBeHidden()
      await expect(listBanner(page)).toBeVisible()
    })

    test('Scenario: Failure simulation set to "0" behaves like no failure', async ({ page }) => {
      await startOnList(page, { [SIMULATE_KEY]: '0' })

      await expect(todoRows(page)).toHaveCount(3)
      await expect(listBanner(page)).toHaveCount(0)
    })

    test('Scenario: A failed save leaves the stored todos untouched', async ({ page }) => {
      await startOnList(page)
      const before = await readStorage(page, 'todo:darshan')
      await openFilledCreateForm(page)
      await setSimulatedErrors(page, true)

      await page.getByTestId('todo-save').click()

      await expect(formBanner(page)).toBeVisible()
      expect(await readStorage(page, 'todo:darshan')).toBe(before)
    })
  })

  test.describe('Rule: Unreadable browser storage', () => {
    test('Scenario: No storage warning is shown when browser storage works', async ({ page }) => {
      await startOnList(page)

      await expect(todoRows(page)).toHaveCount(3)
      await expect(storageWarning(page)).toHaveCount(0)
    })

    test('Scenario: An unreadable localStorage shows a storage warning and the default todos', async ({ page }) => {
      await blockLocalStorage(page)
      await startSession(page)

      await openTodoList(page)

      await expect(storageWarning(page)).toBeVisible()
      await expect(storageWarning(page)).toContainText('Browser storage is unavailable')
      await expect(todoRows(page)).toHaveCount(3)
      await expect(page.getByTestId('todo-row-1')).toContainText('Learn React fundamentals')
    })

    test('Scenario: The app stays usable in memory when localStorage is unreadable', async ({ page }) => {
      await blockLocalStorage(page)
      await startOnList(page)

      await createTodo(page, { description: 'Kept in memory only', targetDate: '2030-12-01' })

      await expect(rowWithText(page, 'Kept in memory only')).toHaveCount(1)
      await expect(storageWarning(page)).toBeVisible()

      await page.getByTestId('todo-delete-1').click()

      await expect(page.getByTestId('todo-row-1')).toHaveCount(0)
      await expect(page.getByTestId('todo-list-loading')).toBeHidden()
      await expect(todoRows(page)).toHaveCount(3)
      await expect(deleteBanner(page)).toHaveCount(0)
    })

    test('Scenario: Todos kept in memory are lost on a refresh as the warning says', async ({ page }) => {
      await blockLocalStorage(page)
      await startOnList(page)
      await createTodo(page, { description: 'Kept in memory only', targetDate: '2030-12-01' })
      await expect(rowWithText(page, 'Kept in memory only')).toHaveCount(1)

      await reloadAndOpenList(page)

      await expect(storageWarning(page)).toBeVisible()
      await expect(todoRows(page)).toHaveCount(3)
      await expect(rowWithText(page, 'Kept in memory only')).toHaveCount(0)
    })
  })

  test.describe('Rule: Full browser storage (QuotaExceededError on write)', () => {
    test.beforeEach(async ({ page }) => {
      await installQuotaSwitch(page)
      await startOnList(page)
      await expect(todoRows(page)).toHaveCount(3)
    })

    test('Scenario: A save fails with an error when storage is full and the stored todos still display', async ({ page }) => {
      const before = await readStorage(page, 'todo:darshan')
      await openFilledCreateForm(page)
      await setStorageFull(page, true)

      await page.getByTestId('todo-save').click()

      await expect(formBanner(page)).toBeVisible()
      await expect(formBanner(page)).toContainText('Unable to write to browser storage')
      await expect(page).toHaveURL(/\/list-todos\/-1$/)

      await page.getByTestId('todo-cancel').click()

      await expect(page).toHaveURL(/\/list-todos$/)
      await expect(todoRows(page)).toHaveCount(3)
      await expect(page.getByTestId('todo-row-1')).toContainText('Learn React fundamentals')
      expect(await readStorage(page, 'todo:darshan')).toBe(before)
    })

    test('Scenario: Saving works again once storage has room', async ({ page }) => {
      await openFilledCreateForm(page)
      await setStorageFull(page, true)
      await page.getByTestId('todo-save').click()
      await expect(formBanner(page)).toBeVisible()

      await setStorageFull(page, false)
      await page.getByTestId('todo-save').click()

      await expect(page).toHaveURL(/\/list-todos$/)
      await expect(rowWithText(page, 'Save into a full store')).toHaveCount(1)
    })

    test('Scenario: A delete fails with an error when storage is full and the todo stays', async ({ page }) => {
      const before = await readStorage(page, 'todo:darshan')
      await setStorageFull(page, true)

      await page.getByTestId('todo-delete-1').click()

      await expect(deleteBanner(page)).toBeVisible()
      await expect(deleteBanner(page)).toContainText('Unable to write to browser storage')
      await expect(page.getByTestId('todo-row-1')).toBeVisible()
      await expect(todoRows(page)).toHaveCount(3)
      expect(await readStorage(page, 'todo:darshan')).toBe(before)
    })
  })
})
