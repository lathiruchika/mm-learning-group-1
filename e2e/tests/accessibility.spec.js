import { test, expect, openLogin, signIn, startSession, startOnList, openTodoList, fillTodoForm } from '../support/app.js'

// Mirrors e2e/features/accessibility.feature (EPMCDMETST-70470).

const description = (page) => page.getByTestId('todo-field-description')
const targetDate = (page) => page.getByTestId('todo-field-targetDate')
const saveButton = (page) => page.getByTestId('todo-save')

async function openCreateForm(page) {
  await startOnList(page)
  await page.getByTestId('todo-add-cta').click()
  await expect(page.getByTestId('todo-form')).toBeVisible()
}

/** Type a description and leave the field so it counts as touched. */
async function enterDescription(page, value) {
  await description(page).fill(value)
  await description(page).blur()
}

test.describe('Feature: Basic accessibility of forms and messages', () => {
  test('Scenario: Form fields are reachable by their labels and start out valid', async ({ page }) => {
    await openCreateForm(page)

    await expect(page.getByLabel('Description')).toHaveAttribute('data-testid', 'todo-field-description')
    await expect(page.getByLabel('Target Date')).toHaveAttribute('data-testid', 'todo-field-targetDate')
    await expect(page.getByLabel('Done')).toHaveAttribute('data-testid', 'todo-field-done')
    await expect(description(page)).toHaveAttribute('aria-invalid', 'false')
    await expect(targetDate(page)).toHaveAttribute('aria-invalid', 'false')
    await expect(page.getByRole('alert')).toHaveCount(0)
  })

  test('Scenario: An invalid description is marked invalid and announced', async ({ page }) => {
    await openCreateForm(page)

    await enterDescription(page, 'abc')

    await expect(description(page)).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByRole('alert')).toHaveCount(1)
    await expect(page.getByRole('alert')).toContainText('at least 8 characters')
    await expect(page.getByTestId('todo-error-description')).toHaveAttribute('role', 'alert')

    await enterDescription(page, 'Long enough text')

    await expect(description(page)).toHaveAttribute('aria-invalid', 'false')
    await expect(page.getByRole('alert')).toHaveCount(0)
  })

  test('Scenario: A missing target date is marked invalid and announced', async ({ page }) => {
    await openCreateForm(page)
    await fillTodoForm(page, { description: 'A valid description' })

    await targetDate(page).focus()
    await targetDate(page).blur()

    await expect(targetDate(page)).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByRole('alert')).toHaveCount(1)
    await expect(page.getByRole('alert')).toContainText('Target date is required')
    await expect(page.getByTestId('todo-error-targetDate')).toHaveAttribute('role', 'alert')

    await fillTodoForm(page, { targetDate: '2030-01-15' })

    await expect(targetDate(page)).toHaveAttribute('aria-invalid', 'false')
    await expect(page.getByRole('alert')).toHaveCount(0)
  })

  test('Scenario: Save stays disabled until the whole form is valid', async ({ page }) => {
    await openCreateForm(page)
    await expect(saveButton(page)).toBeDisabled()

    await fillTodoForm(page, { description: 'Long enough text' })
    await expect(saveButton(page)).toBeDisabled()

    await fillTodoForm(page, { targetDate: '2030-01-15' })
    await expect(saveButton(page)).toBeEnabled()

    await fillTodoForm(page, { description: '' })
    await expect(saveButton(page)).toBeDisabled()
  })

  test('Scenario: The edit form marks an existing invalid todo immediately', async ({ page }) => {
    const invalidTodo = [{ id: 1, description: 'short', done: false, targetDate: '2030-01-01' }]
    await startOnList(page, { 'todo:darshan': invalidTodo })

    await page.getByTestId('todo-edit-1').click()

    await expect(page.getByTestId('todo-form')).toBeVisible()
    await expect(description(page)).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByRole('alert')).toHaveCount(1)
    await expect(page.getByRole('alert')).toContainText('at least 8 characters')
    await expect(saveButton(page)).toBeDisabled()

    await enterDescription(page, 'Now long enough to save')

    await expect(description(page)).toHaveAttribute('aria-invalid', 'false')
    await expect(saveButton(page)).toBeEnabled()
  })

  test('Scenario: Loading and error messages use live-region roles', async ({ page }) => {
    await startSession(page, { 'dummy-api:simulate-error': '1' })

    await openTodoList(page)

    await expect(page.getByTestId('todo-list-loading')).toHaveAttribute('role', 'status')
    await expect(page.getByTestId('todo-list-error-banner')).toHaveAttribute('role', 'alert')
    await expect(page.getByRole('alert')).toContainText('Simulated server error')
  })

  test('Scenario: The login failure message is announced to assistive technology', async ({ page }) => {
    test.fixme(
      true,
      'Blocked by the login bug at src/components/Login.jsx:27 (the message never renders). Once fixed, Login.jsx:38 still renders it in a plain div without role=alert, so screen readers are not told the login failed.',
    )
    await openLogin(page)

    await signIn(page, 'darshan', 'wrong')

    await expect(page.getByRole('alert')).toContainText('Authentication Failed')
  })
})
