import {
  test,
  expect,
  startOnList,
  createTodo,
  fillTodoForm,
  reloadAndOpenList,
  readJson,
  storedIds,
  rowWithText,
  rowId,
  todoRows,
  seedTodos,
} from '../support/app.js'

// Mirrors e2e/features/todo-fields.feature (EPMCDMETST-70470).

const doneCell = (page, id) => page.getByTestId(`todo-row-${id}`).getByRole('cell').nth(1)
const dateCell = (page, id) => page.getByTestId(`todo-row-${id}`).getByRole('cell').nth(2)

/** Open the edit form of a todo, change it and save; ends back on the list. */
async function updateTodo(page, id, changes) {
  await page.getByTestId(`todo-edit-${id}`).click()
  await expect(page.getByTestId('todo-form')).toBeVisible()
  await fillTodoForm(page, changes)
  await expect(page.getByTestId('todo-save')).toBeEnabled()
  await page.getByTestId('todo-save').click()
  await expect(page).toHaveURL(/\/list-todos$/)
  await expect(page.getByTestId('todo-list-loading')).toBeHidden()
}

/** Delete a row and wait until the list has reloaded. */
async function deleteTodo(page, id) {
  await page.getByTestId(`todo-delete-${id}`).click()
  await expect(page.getByTestId(`todo-row-${id}`)).toHaveCount(0)
  await expect(page.getByTestId('todo-list-loading')).toBeHidden()
}

test.describe('Feature: Todo fields and ids', () => {
  test.beforeEach(async ({ page }) => {
    // Fixed dates, so values can be compared exactly.
    await startOnList(page, { 'todo:darshan': seedTodos })
    await expect(todoRows(page)).toHaveCount(3)
  })

  // Scenario Outline: Toggling Done on an existing todo is saved and shown in the list
  const toggles = [
    { name: 'open to done', id: 1, before: false, after: true },
    { name: 'done back to open', id: 3, before: true, after: false },
  ]
  for (const { name, id, before, after } of toggles) {
    test(`Scenario Outline: Toggling Done on an existing todo is saved and shown in the list (${name})`, async ({ page }) => {
      const original = seedTodos.find((t) => t.id === id)
      await expect(doneCell(page, id)).toHaveText(String(before))

      await updateTodo(page, id, { done: after })

      await expect(doneCell(page, id)).toHaveText(String(after))

      await reloadAndOpenList(page)

      await expect(doneCell(page, id)).toHaveText(String(after))
      await expect(page.getByTestId(`todo-row-${id}`)).toContainText(original.description)
      await expect(dateCell(page, id)).toHaveText(original.targetDate)
      const stored = (await readJson(page, 'todo:darshan')).find((t) => t.id === id)
      expect(stored).toEqual({ ...original, done: after })
    })
  }

  test('Scenario: Editing the description and date persists after a refresh', async ({ page }) => {
    await updateTodo(page, 2, { description: 'Build the todo frontend v2', targetDate: '2031-02-03' })

    const expectUpdated = async () => {
      await expect(page.getByTestId('todo-row-2')).toContainText('Build the todo frontend v2')
      await expect(dateCell(page, 2)).toHaveText('2031-02-03')
    }
    await expectUpdated()
    await expect(todoRows(page)).toHaveCount(3)
    expect(await storedIds(page)).toEqual([1, 2, 3])

    await reloadAndOpenList(page)

    await expectUpdated()
    await expect(todoRows(page)).toHaveCount(3)
    const stored = (await readJson(page, 'todo:darshan')).find((t) => t.id === 2)
    expect(stored).toEqual({
      id: 2,
      description: 'Build the todo frontend v2',
      done: false,
      targetDate: '2031-02-03',
    })
  })

  test('Scenario: A todo created with Done checked is listed as done and stays done', async ({ page }) => {
    await createTodo(page, { description: 'Already finished chore', targetDate: '2030-10-10', done: true })
    const row = rowWithText(page, 'Already finished chore')
    await expect(row).toHaveCount(1)
    const id = await rowId(row)
    await expect(doneCell(page, id)).toHaveText('true')

    await reloadAndOpenList(page)

    await expect(doneCell(page, id)).toHaveText('true')
    const stored = (await readJson(page, 'todo:darshan')).find((t) => t.description === 'Already finished chore')
    expect(stored.done).toBe(true)
  })

  test('Scenario: A todo created without touching Done is listed as not done', async ({ page }) => {
    await createTodo(page, { description: 'Not finished yet', targetDate: '2030-10-11' })

    const row = rowWithText(page, 'Not finished yet')
    await expect(row).toHaveCount(1)
    await expect(doneCell(page, await rowId(row))).toHaveText('false')
  })

  test('Scenario: Ids keep increasing across create, delete, create and a reload', async ({ page }) => {
    await createTodo(page, { description: 'First added todo', targetDate: '2030-11-01' })
    await expect(page.getByTestId('todo-row-4')).toContainText('First added todo')

    await deleteTodo(page, 4)
    await createTodo(page, { description: 'Second added todo', targetDate: '2030-11-02' })
    await expect(page.getByTestId('todo-row-5')).toContainText('Second added todo')
    await expect(page.getByTestId('todo-row-4')).toHaveCount(0)

    await reloadAndOpenList(page)
    await deleteTodo(page, 5)
    await createTodo(page, { description: 'Third added todo', targetDate: '2030-11-03' })

    await expect(page.getByTestId('todo-row-6')).toContainText('Third added todo')
    expect(await storedIds(page)).toEqual([1, 2, 3, 6])
  })
})
