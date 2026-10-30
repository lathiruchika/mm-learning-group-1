import {
  test,
  expect,
  startSession,
  startOnList,
  openTodoList,
  setSimulatedErrors,
  navigateInApp,
  fillTodoForm,
  rowWithText,
  todoRows,
  readJson,
  SIMULATE_KEY,
} from '../support/app.js'

// Mirrors e2e/features/ux-states.feature (EPMCDMETST-70466).
test.describe('Feature: Loading, empty and error states', () => {
  test('Scenario: A loading indicator is visible while todos are loading', async ({ page }) => {
    await startSession(page)

    await openTodoList(page)

    // The suite runs with VITE_DUMMY_API_DELAY_MS=300, so the indicator is observable.
    await expect(page.getByTestId('todo-list-loading')).toBeVisible()
    await expect(page.getByTestId('todo-list-loading')).toBeHidden()
    await expect(page.getByTestId('todo-row-1')).toBeVisible()
  })

  test('Scenario: An empty list shows an empty state with an add call to action', async ({ page }) => {
    await startOnList(page, { 'todo:darshan': '[]' })

    await expect(page.getByTestId('todo-list-empty')).toBeVisible()
    await expect(page.getByTestId('todo-add-cta')).toHaveCount(1)
    await expect(page.getByTestId('todo-list-empty').getByTestId('todo-add-cta')).toBeVisible()

    await page.getByTestId('todo-add-cta').click()

    await expect(page).toHaveURL(/\/list-todos\/-1$/)
    await expect(page.getByTestId('todo-form')).toBeVisible()
  })

  test('Scenario: Deleting the last remaining todo shows the empty state', async ({ page }) => {
    const only = [{ id: 1, description: 'Only remaining todo', done: false, targetDate: '2030-01-01' }]
    await startOnList(page, { 'todo:darshan': only })
    await expect(todoRows(page)).toHaveCount(1)

    await page.getByTestId('todo-delete-1').click()

    await expect(page.getByTestId('todo-list-empty')).toBeVisible()
    await expect(todoRows(page)).toHaveCount(0)
  })

  test('Scenario: A list failure shows an error banner and Retry recovers', async ({ page }) => {
    await startSession(page, { [SIMULATE_KEY]: '1' })
    await openTodoList(page)

    await expect(page.getByTestId('todo-list-error-banner')).toBeVisible()
    await expect(page.getByTestId('todo-list-error-banner')).toContainText('Simulated server error')
    await expect(todoRows(page)).toHaveCount(0)
    await expect(page.getByTestId('todo-list-empty')).toHaveCount(0)

    await setSimulatedErrors(page, false)
    await page.getByTestId('todo-list-retry').click()

    await expect(page.getByTestId('todo-list-error-banner')).toHaveCount(0)
    await expect(todoRows(page)).toHaveCount(3)
  })

  test('Scenario: Retry keeps the error banner while the failure persists', async ({ page }) => {
    await startSession(page, { [SIMULATE_KEY]: '1' })
    await openTodoList(page)
    await expect(page.getByTestId('todo-list-error-banner')).toBeVisible()

    await page.getByTestId('todo-list-retry').click()

    await expect(page.getByTestId('todo-list-loading')).toBeVisible()
    await expect(page.getByTestId('todo-list-loading')).toBeHidden()
    await expect(page.getByTestId('todo-list-error-banner')).toBeVisible()
  })

  test('Scenario: A delete failure shows a banner and its Retry repeats the delete', async ({ page }) => {
    await startOnList(page)
    await setSimulatedErrors(page, true)

    await page.getByTestId('todo-delete-1').click()

    await expect(page.getByTestId('todo-delete-error-banner')).toBeVisible()
    await expect(page.getByTestId('todo-row-1')).toBeVisible()

    await setSimulatedErrors(page, false)
    await page.getByTestId('todo-delete-retry').click()

    await expect(page.getByTestId('todo-delete-error-banner')).toHaveCount(0)
    await expect(page.getByTestId('todo-row-1')).toHaveCount(0)
    const stored = await readJson(page, 'todo:darshan')
    expect(stored.map((t) => t.id)).toEqual([2, 3])
  })

  test('Scenario: A missing todo shows a not found panel with a way back', async ({ page }) => {
    await startOnList(page)

    await navigateInApp(page, '/list-todos/9999')

    await expect(page.getByTestId('todo-not-found')).toBeVisible()
    await expect(page.getByTestId('todo-form')).toHaveCount(0)

    await page.getByTestId('todo-not-found').getByRole('button', { name: 'Back to todos' }).click()

    await expect(page).toHaveURL(/\/list-todos$/)
    await expect(page.getByTestId('todo-row-1')).toBeVisible()
  })

  test('Scenario: A failure while loading a todo for editing shows a banner and Retry recovers', async ({ page }) => {
    await startOnList(page)
    await setSimulatedErrors(page, true)

    await page.getByTestId('todo-edit-1').click()

    await expect(page.getByTestId('todo-form-error-banner')).toBeVisible()
    await expect(page.getByTestId('todo-form')).toHaveCount(0)

    await setSimulatedErrors(page, false)
    await page.getByTestId('todo-form-retry').click()

    await expect(page.getByTestId('todo-form')).toBeVisible()
    await expect(page.getByTestId('todo-field-description')).toHaveValue('Learn React fundamentals')
    await expect(page.getByTestId('todo-form-error-banner')).toHaveCount(0)
  })

  test('Scenario: A failure while saving shows a banner and saving again succeeds', async ({ page }) => {
    await startOnList(page)
    await page.getByTestId('todo-add-cta').click()
    await fillTodoForm(page, { description: 'Save despite failure', targetDate: '2030-09-09' })
    await expect(page.getByTestId('todo-save')).toBeEnabled()
    await setSimulatedErrors(page, true)

    await page.getByTestId('todo-save').click()

    await expect(page.getByTestId('todo-form-error-banner')).toBeVisible()
    await expect(page).toHaveURL(/\/list-todos\/-1$/)

    await setSimulatedErrors(page, false)
    await page.getByTestId('todo-save').click()

    await expect(page).toHaveURL(/\/list-todos$/)
    await expect(rowWithText(page, 'Save despite failure')).toHaveCount(1)
  })
})
