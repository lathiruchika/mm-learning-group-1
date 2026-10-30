import {
  test,
  expect,
  startOnList,
  fillTodoForm,
  rowWithText,
  todoRows,
  readJson,
} from '../support/app.js'

// Mirrors e2e/features/validation.feature (EPMCDMETST-70467).

const EMOJI = '\u{1F600}'

async function openCreateForm(page, storage = {}) {
  await startOnList(page, storage)
  await page.getByTestId('todo-add-cta').click()
  await expect(page.getByTestId('todo-form')).toBeVisible()
}

/** Type a description and leave the field so it counts as touched. */
async function enterDescription(page, description) {
  const field = page.getByTestId('todo-field-description')
  await field.fill(description)
  await field.blur()
}

const descriptionError = (page) => page.getByTestId('todo-error-description')
const dateError = (page) => page.getByTestId('todo-error-targetDate')
const saveButton = (page) => page.getByTestId('todo-save')

test.describe('Feature: Todo form validation and inline feedback', () => {
  test.describe('Rule: Create form', () => {
    test.beforeEach(async ({ page }) => {
      await openCreateForm(page)
    })

    test('Scenario: A pristine create form has Save disabled and shows no errors yet', async ({ page }) => {
      await expect(saveButton(page)).toBeDisabled()
      await expect(descriptionError(page)).toHaveCount(0)
      await expect(dateError(page)).toHaveCount(0)
    })

    // Scenario Outline: An invalid description blocks saving with an inline message
    const invalidDescriptions = [
      { name: 'whitespace only', value: ' '.repeat(8), message: 'Description is required' },
      { name: 'fewer than 8 characters', value: 'abcdefg', message: 'at least 8 characters' },
      { name: 'too short once padding trimmed', value: '   abc   ', message: 'at least 8 characters' },
      { name: '7 emoji', value: EMOJI.repeat(7), message: 'at least 8 characters' },
    ]
    for (const example of invalidDescriptions) {
      test(`Scenario Outline: An invalid description blocks saving with an inline message (${example.name})`, async ({ page }) => {
        await fillTodoForm(page, { targetDate: '2030-01-15' })

        await enterDescription(page, example.value)

        await expect(descriptionError(page)).toBeVisible()
        await expect(descriptionError(page)).toContainText(example.message)
        await expect(saveButton(page)).toBeDisabled()
        // A date that is valid must not produce a date error.
        await expect(dateError(page)).toHaveCount(0)
      })
    }

    test('Scenario: A missing target date blocks saving with an inline message', async ({ page }) => {
      await fillTodoForm(page, { description: 'A valid description' })

      const date = page.getByTestId('todo-field-targetDate')
      await date.focus()
      await date.blur()

      await expect(dateError(page)).toBeVisible()
      await expect(dateError(page)).toContainText('Target date is required')
      await expect(saveButton(page)).toBeDisabled()
    })

    test('Scenario: A partially entered target date is not accepted', async ({ page }) => {
      await fillTodoForm(page, { description: 'A valid description' })

      // The native date control only yields a value once month, day and year are all set.
      const date = page.getByTestId('todo-field-targetDate')
      await date.focus()
      await page.keyboard.type('02')
      await date.blur()

      await expect(dateError(page)).toBeVisible()
      await expect(saveButton(page)).toBeDisabled()
    })

    test('Scenario: An impossible calendar date is rejected', async ({ page }) => {
      await fillTodoForm(page, { description: 'A valid description' })

      // A native date control cannot hold 2025-02-30, so switch the input to text
      // to exercise the YYYY-MM-DD validator the same way pasted/typed text would.
      const date = page.getByTestId('todo-field-targetDate')
      await date.evaluate((el) => {
        el.type = 'text'
      })
      await date.fill('2025-02-30')
      await date.blur()

      await expect(dateError(page)).toBeVisible()
      await expect(dateError(page)).toContainText('valid date')
      await expect(saveButton(page)).toBeDisabled()
    })

    test('Scenario: Valid input saves and returns to the list', async ({ page }) => {
      await fillTodoForm(page, { description: 'Water the garden plants', targetDate: '2030-04-20' })

      await expect(saveButton(page)).toBeEnabled()
      await expect(descriptionError(page)).toHaveCount(0)
      await expect(dateError(page)).toHaveCount(0)
      await saveButton(page).click()

      await expect(page).toHaveURL(/\/list-todos$/)
      await expect(rowWithText(page, 'Water the garden plants')).toHaveCount(1)
      await expect(rowWithText(page, 'Water the garden plants')).toContainText('2030-04-20')
    })

    test('Scenario: Surrounding whitespace is trimmed when saving', async ({ page }) => {
      await fillTodoForm(page, { description: '   Trim these spaces   ', targetDate: '2030-04-21' })

      await saveButton(page).click()

      await expect(page).toHaveURL(/\/list-todos$/)
      await expect(rowWithText(page, 'Trim these spaces')).toHaveCount(1)
      const stored = await readJson(page, 'todo:darshan')
      expect(stored.map((t) => t.description)).toContain('Trim these spaces')
    })

    test('Scenario: Errors clear after the description is corrected', async ({ page }) => {
      await fillTodoForm(page, { targetDate: '2030-01-15' })
      await enterDescription(page, 'abc')
      await expect(descriptionError(page)).toBeVisible()

      await enterDescription(page, 'Now it is long enough')

      await expect(descriptionError(page)).toHaveCount(0)
      await expect(saveButton(page)).toBeEnabled()
    })

    test('Scenario: Errors clear after the target date is corrected', async ({ page }) => {
      await fillTodoForm(page, { description: 'A valid description' })
      const date = page.getByTestId('todo-field-targetDate')
      await date.focus()
      await date.blur()
      await expect(dateError(page)).toBeVisible()

      await fillTodoForm(page, { targetDate: '2030-01-15' })

      await expect(dateError(page)).toHaveCount(0)
      await expect(saveButton(page)).toBeEnabled()
    })

    test('Scenario: A description of exactly 8 emoji is accepted', async ({ page }) => {
      const eightEmoji = EMOJI.repeat(8)
      await fillTodoForm(page, { targetDate: '2030-02-02' })
      await enterDescription(page, eightEmoji)

      await expect(descriptionError(page)).toHaveCount(0)
      await expect(saveButton(page)).toBeEnabled()
      await saveButton(page).click()

      await expect(page).toHaveURL(/\/list-todos$/)
      await expect(rowWithText(page, eightEmoji)).toHaveCount(1)
    })

    test('Scenario: Cancel leaves the form without saving', async ({ page }) => {
      await fillTodoForm(page, { description: 'Never to be saved', targetDate: '2030-03-03' })

      await page.getByTestId('todo-cancel').click()

      await expect(page).toHaveURL(/\/list-todos$/)
      await expect(todoRows(page)).toHaveCount(3)
      await expect(rowWithText(page, 'Never to be saved')).toHaveCount(0)
    })
  })

  test.describe('Rule: Editing an existing todo', () => {
    const invalidTodo = [{ id: 1, description: 'short', done: false, targetDate: '2030-01-01' }]

    test.beforeEach(async ({ page }) => {
      await startOnList(page, { 'todo:darshan': invalidTodo })
      await page.getByTestId('todo-edit-1').click()
      await expect(page.getByTestId('todo-form')).toBeVisible()
    })

    test('Scenario: An existing todo that breaks the rules shows its errors immediately', async ({ page }) => {
      // No interaction with the field: errors must already be visible.
      await expect(descriptionError(page)).toBeVisible()
      await expect(descriptionError(page)).toContainText('at least 8 characters')
      await expect(saveButton(page)).toBeDisabled()
    })

    test('Scenario: Fixing an invalid existing todo allows saving', async ({ page }) => {
      await enterDescription(page, 'Now long enough to save')

      await expect(descriptionError(page)).toHaveCount(0)
      await expect(saveButton(page)).toBeEnabled()
      await saveButton(page).click()

      await expect(page).toHaveURL(/\/list-todos$/)
      await expect(page.getByTestId('todo-row-1')).toContainText('Now long enough to save')
    })
  })
})
