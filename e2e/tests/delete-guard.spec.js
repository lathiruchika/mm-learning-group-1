import {
  test,
  expect,
  startOnList,
  setSimulatedErrors,
  installApiCallCounter,
  apiCallCount,
  resetApiCallCount,
  readStorage,
  storedIds,
  todoRows,
} from '../support/app.js'

// Mirrors e2e/features/delete-guard.feature (EPMCDMETST-70470).
// The suite runs with VITE_DUMMY_API_DELAY_MS=300, which keeps a delete in flight long
// enough to assert on, and each assertion below is checked as soon as the click returns.

const deleteError = (page) => page.getByTestId('todo-delete-error-banner')
const loading = (page) => page.getByTestId('todo-list-loading')

test.describe('Feature: Deleting todos safely', () => {
  test('Scenario: While a delete is in flight only that row has its Delete button disabled', async ({ page }) => {
    await startOnList(page)

    await page.getByTestId('todo-delete-1').click()

    await expect(page.getByTestId('todo-delete-1')).toBeDisabled()
    await expect(page.getByTestId('todo-delete-2')).toBeEnabled()
    await expect(page.getByText('Todo with id: 1 is deleted.')).toBeVisible()
    await expect(page.getByTestId('todo-row-1')).toHaveCount(0)
  })

  test('Scenario: A double click on Delete sends only one delete request', async ({ page }) => {
    await installApiCallCounter(page)
    await startOnList(page)
    await resetApiCallCount(page)

    await page.getByTestId('todo-delete-1').dblclick()

    // The list reloads after a successful delete; wait for that to finish.
    await expect(page.getByText('Todo with id: 1 is deleted.')).toBeVisible()
    await expect(loading(page)).toBeHidden()
    await expect(todoRows(page)).toHaveCount(2)
    await expect(page.getByTestId('todo-row-1')).toHaveCount(0)

    // One delete + one list reload. A second delete would make it 3 (and fail with NOT_FOUND).
    expect(await apiCallCount(page)).toBe(2)
    await expect(deleteError(page)).toHaveCount(0)
    expect(await storedIds(page)).toEqual([2, 3])
  })

  test('Scenario: Two different rows can be deleted back to back', async ({ page }) => {
    await startOnList(page)

    await page.getByTestId('todo-delete-1').click()
    // The second click lands while the first delete is still in flight.
    await page.getByTestId('todo-delete-2').click()

    await expect(todoRows(page)).toHaveCount(1)
    await expect(page.getByTestId('todo-row-3')).toBeVisible()
    await expect(loading(page)).toBeHidden()
    await expect(deleteError(page)).toHaveCount(0)
    expect(await storedIds(page)).toEqual([3])
  })

  test('Scenario: A failed delete enables the Delete button again', async ({ page }) => {
    await startOnList(page)
    await setSimulatedErrors(page, true)

    await page.getByTestId('todo-delete-1').click()

    await expect(page.getByTestId('todo-delete-1')).toBeDisabled()
    await expect(deleteError(page)).toBeVisible()
    await expect(page.getByTestId('todo-delete-1')).toBeEnabled()
    await expect(page.getByTestId('todo-row-1')).toBeVisible()
  })

  test('Scenario: Deleting every todo shows the empty state', async ({ page }) => {
    await startOnList(page)

    for (const id of [1, 2, 3]) {
      await page.getByTestId(`todo-delete-${id}`).click()
      await expect(page.getByTestId(`todo-row-${id}`)).toHaveCount(0)
      await expect(loading(page)).toBeHidden()
    }

    await expect(page.getByTestId('todo-list-empty')).toBeVisible()
    await expect(todoRows(page)).toHaveCount(0)
    await expect(page.getByTestId('todo-add-cta')).toHaveCount(1)
    expect(await readStorage(page, 'todo:darshan')).toBe('[]')
  })
})
