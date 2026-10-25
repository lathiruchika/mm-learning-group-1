import { test, expect } from '@playwright/test'
import { seedTodos, rows, visibleDescriptions, todayIso } from './helpers.js'

// EPMCDMETST-66717: add-form and inline-edit validation, saving state, edit errors.

const ONE_TODO = [{ description: 'Write the report', targetDate: '2026-11-05' }]

test.describe('@EPMCDMETST-66717 add form validation', () => {
  test.beforeEach(async ({ page }) => {
    await seedTodos(page, ONE_TODO)
    await page.goto('/')
    await expect(rows(page)).toHaveCount(1)
  })

  test('no error is shown before the user touches a field', async ({ page }) => {
    await expect(page.getByTestId('todo-description-error')).toHaveCount(0)
    await expect(page.getByTestId('todo-targetDate-error')).toHaveCount(0)
    // An empty form is invalid, so Add starts disabled.
    await expect(page.getByTestId('todo-add-btn')).toBeDisabled()
  })

  test('a description shorter than 8 characters shows an error and blocks Add', async ({
    page,
  }) => {
    await page.getByTestId('todo-description-input').fill('short')
    await expect(page.getByTestId('todo-description-error')).toHaveText(
      'Description must be at least 8 characters',
    )
    await expect(page.getByTestId('todo-add-btn')).toBeDisabled()
    await expect(rows(page)).toHaveCount(1)
  })

  test('the length rule applies after trimming whitespace', async ({ page }) => {
    await page.getByTestId('todo-description-input').fill('  1234567  ') // 7 once trimmed
    await expect(page.getByTestId('todo-description-error')).toContainText('at least 8')
    await expect(page.getByTestId('todo-add-btn')).toBeDisabled()
  })

  test('a whitespace-only description reads as required', async ({ page }) => {
    await page.getByTestId('todo-description-input').fill('        ')
    await expect(page.getByTestId('todo-description-error')).toHaveText(
      'Description is required',
    )
    await expect(page.getByTestId('todo-add-btn')).toBeDisabled()
  })

  test('a target date in the past shows an error and blocks Add', async ({ page }) => {
    await page.getByTestId('todo-description-input').fill('Plan the sprint')
    await page.getByTestId('todo-targetDate-input').fill('2020-01-01')
    await expect(page.getByTestId('todo-targetDate-error')).toHaveText(
      'Target date cannot be in the past',
    )
    await expect(page.getByTestId('todo-add-btn')).toBeDisabled()
    await expect(rows(page)).toHaveCount(1)
  })

  test("today's date is accepted", async ({ page }) => {
    await page.getByTestId('todo-description-input').fill('Plan the sprint')
    await page.getByTestId('todo-targetDate-input').fill(todayIso())
    await expect(page.getByTestId('todo-targetDate-error')).toHaveCount(0)
    await expect(page.getByTestId('todo-add-btn')).toBeEnabled()
  })

  test('an empty target date is allowed and the todo is added', async ({ page }) => {
    await page.getByTestId('todo-description-input').fill('Write the retro notes')
    await page.getByTestId('todo-add-btn').click()

    await expect(rows(page)).toHaveCount(2)
    await expect
      .poll(() => visibleDescriptions(page))
      .toContain('Write the retro notes')
    // The form resets after a successful add.
    await expect(page.getByTestId('todo-description-input')).toHaveValue('')
    await expect(page.getByTestId('todo-description-error')).toHaveCount(0)
  })

  test('the description is trimmed before it is saved', async ({ page }) => {
    await page.getByTestId('todo-description-input').fill('   Review the design   ')
    await page.getByTestId('todo-add-btn').click()
    await expect
      .poll(() => visibleDescriptions(page))
      .toContain('Review the design')
  })

  test('a double click on Add creates exactly one todo', async ({ page }) => {
    await page.getByTestId('todo-description-input').fill('Write the retro notes')
    await page.getByTestId('todo-add-btn').dblclick()

    await expect(rows(page)).toHaveCount(2)
    const added = (await visibleDescriptions(page)).filter(
      (d) => d === 'Write the retro notes',
    )
    expect(added).toHaveLength(1)
  })

  test('a valid todo with a future date is added and persists across reload', async ({
    page,
  }) => {
    await page.getByTestId('todo-description-input').fill('Ship the release')
    await page.getByTestId('todo-targetDate-input').fill('2099-01-01')
    await page.getByTestId('todo-add-btn').click()
    await expect(rows(page)).toHaveCount(2)

    await page.reload()
    await expect
      .poll(() => visibleDescriptions(page))
      .toContain('Ship the release')
  })
})

test.describe('@EPMCDMETST-66717 inline edit validation', () => {
  test.beforeEach(async ({ page }) => {
    await seedTodos(page, ONE_TODO)
    await page.goto('/')
    await page.getByTestId('todo-edit-btn-1').click()
    await expect(page.getByTestId('todo-edit-input-1')).toBeVisible()
  })

  test('a too-short edit shows an error, stays in edit mode, and saves nothing', async ({
    page,
  }) => {
    const input = page.getByTestId('todo-edit-input-1')
    await input.fill('short')
    await input.press('Enter')

    await expect(page.getByTestId('todo-edit-error-1')).toContainText('at least 8')
    await expect(input).toBeVisible()

    // Escape cancels and the original text is untouched.
    await input.press('Escape')
    await expect(input).toHaveCount(0)
    await expect.poll(() => visibleDescriptions(page)).toEqual(['Write the report'])
  })

  test('clearing the text shows the required message', async ({ page }) => {
    const input = page.getByTestId('todo-edit-input-1')
    await input.fill('')
    await input.press('Enter')
    await expect(page.getByTestId('todo-edit-error-1')).toHaveText('Description is required')
  })

  test('typing again clears the edit error', async ({ page }) => {
    const input = page.getByTestId('todo-edit-input-1')
    await input.fill('short')
    await input.press('Enter')
    await expect(page.getByTestId('todo-edit-error-1')).toBeVisible()

    await input.fill('a much longer description')
    await expect(page.getByTestId('todo-edit-error-1')).toHaveCount(0)
  })

  test('an unchanged edit simply closes without validating', async ({ page }) => {
    await page.getByTestId('todo-edit-input-1').press('Enter')
    await expect(page.getByTestId('todo-edit-input-1')).toHaveCount(0)
    await expect(page.getByTestId('todo-edit-error-1')).toHaveCount(0)
  })

  test('a valid edit is saved and persists across reload', async ({ page }) => {
    const input = page.getByTestId('todo-edit-input-1')
    await input.fill('Write the final report')
    await input.press('Enter')

    await expect(input).toHaveCount(0)
    await expect.poll(() => visibleDescriptions(page)).toEqual(['Write the final report'])

    await page.reload()
    await expect.poll(() => visibleDescriptions(page)).toEqual(['Write the final report'])
  })

  test('a provider failure shows a readable message and the editor stays usable', async ({
    page,
  }) => {
    // Remove the todo behind the app's back so the provider rejects the update
    // with "Todo 1 not found".
    await page.evaluate(() =>
      localStorage.setItem(
        'mm.todos.v1',
        JSON.stringify({ schemaVersion: 1, nextId: 2, todos: [] }),
      ),
    )

    const input = page.getByTestId('todo-edit-input-1')
    await input.fill('Write the final report')
    await input.press('Enter')

    const error = page.getByTestId('todo-edit-error-1')
    await expect(error).toHaveText('Todo 1 not found')
    await expect(error).toHaveAttribute('role', 'alert')

    // Not a raw stack or object dump, and the user can still back out.
    await expect(error).not.toContainText('Error:')
    await expect(input).toBeEnabled()
    await input.press('Escape')
    await expect(input).toHaveCount(0)
  })
})
