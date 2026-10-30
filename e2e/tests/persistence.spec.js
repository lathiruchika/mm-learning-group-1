import {
  test,
  expect,
  openLogin,
  signIn,
  openTodoList,
  seedStorage,
  readStorage,
  readJson,
  startOnList,
  createTodo,
  fillTodoForm,
  rowWithText,
  todoRows,
  seedTodos,
} from '../support/app.js'

// Mirrors e2e/features/persistence.feature (EPMCDMETST-70465).
test.describe('Feature: Dummy API persistence in localStorage (no backend)', () => {
  test('Scenario: First load seeds three default todos', async ({ page }) => {
    await startOnList(page)

    await expect(todoRows(page)).toHaveCount(3)
    await expect(page.getByTestId('todo-row-1')).toContainText('Learn React fundamentals')
    await expect(page.getByTestId('todo-row-2')).toContainText('Build the todo frontend')
    await expect(page.getByTestId('todo-row-3')).toContainText('Write project documentation')
    await expect(page.getByTestId('todo-row-3')).toContainText('true')
    await expect(page.getByTestId('todo-row-1')).toContainText('false')
  })

  test('Scenario: Creating, editing and deleting a todo makes no request to localhost:8080', async ({
    page,
    backendRequests,
  }) => {
    await startOnList(page)

    // create
    await createTodo(page, { description: 'Buy groceries today', targetDate: '2030-05-01' })
    const created = rowWithText(page, 'Buy groceries today')
    await expect(created).toHaveCount(1)

    // edit
    const createdId = (await created.getAttribute('data-testid')).replace('todo-row-', '')
    await page.getByTestId(`todo-edit-${createdId}`).click()
    await expect(page.getByTestId('todo-form')).toBeVisible()
    await expect(page.getByTestId('todo-field-description')).toHaveValue('Buy groceries today')
    await fillTodoForm(page, { description: 'Buy groceries and fruit' })
    await page.getByTestId('todo-save').click()
    await expect(page).toHaveURL(/\/list-todos$/)
    await expect(rowWithText(page, 'Buy groceries and fruit')).toHaveCount(1)
    await expect(rowWithText(page, 'Buy groceries today')).toHaveCount(0)

    // delete
    await page.getByTestId(`todo-delete-${createdId}`).click()
    await expect(page.getByTestId(`todo-row-${createdId}`)).toHaveCount(0)
    await expect(todoRows(page)).toHaveCount(3)

    expect(backendRequests, 'requests to localhost:8080').toEqual([])
  })

  test('Scenario: Todos survive a page refresh', async ({ page }) => {
    await startOnList(page)
    await createTodo(page, { description: 'Persist me across reloads', targetDate: '2030-06-15' })
    await expect(rowWithText(page, 'Persist me across reloads')).toHaveCount(1)

    await page.reload()
    // A reload drops the in-memory login, so sign in again.
    await expect(page.locator('input[name="username"]')).toBeVisible()
    await signIn(page)
    await openTodoList(page)

    await expect(todoRows(page)).toHaveCount(4)
    await expect(rowWithText(page, 'Persist me across reloads')).toHaveCount(1)
    const stored = await readJson(page, 'todo:darshan')
    expect(stored.map((t) => t.description)).toContain('Persist me across reloads')
  })

  test('Scenario: Each user keeps a separate set of todos', async ({ page }) => {
    const aliceTodos = [{ id: 1, description: 'Alice private todo', done: false, targetDate: '2030-01-01' }]
    await startOnList(page, { 'todo:alice': aliceTodos })
    const aliceBefore = await readStorage(page, 'todo:alice')

    await createTodo(page, { description: 'Darshan only todo', targetDate: '2030-07-01' })

    await expect(rowWithText(page, 'Alice private todo')).toHaveCount(0)
    await expect(rowWithText(page, 'Darshan only todo')).toHaveCount(1)
    expect(await readStorage(page, 'todo:alice')).toBe(aliceBefore)
    const darshan = await readJson(page, 'todo:darshan')
    expect(darshan.map((t) => t.description)).toContain('Darshan only todo')
    expect(darshan.map((t) => t.description)).not.toContain('Alice private todo')
  })

  test('Scenario: An explicitly empty list stays empty after reload', async ({ page }) => {
    await startOnList(page, { 'todo:darshan': '[]' })
    await expect(page.getByTestId('todo-list-empty')).toBeVisible()
    await expect(todoRows(page)).toHaveCount(0)

    await page.reload()
    await expect(page.locator('input[name="username"]')).toBeVisible()
    await signIn(page)
    await openTodoList(page)

    await expect(page.getByTestId('todo-list-empty')).toBeVisible()
    await expect(todoRows(page)).toHaveCount(0)
    expect(await readStorage(page, 'todo:darshan')).toBe('[]')
  })

  test('Scenario: The id of a deleted todo is not reused', async ({ page }) => {
    await startOnList(page)

    await page.getByTestId('todo-delete-3').click()
    await expect(page.getByTestId('todo-row-3')).toHaveCount(0)

    await createTodo(page, { description: 'Brand new todo item', targetDate: '2030-08-01' })

    await expect(page.getByTestId('todo-row-4')).toContainText('Brand new todo item')
    await expect(page.getByTestId('todo-row-3')).toHaveCount(0)
    const ids = (await readJson(page, 'todo:darshan')).map((t) => t.id)
    expect(ids).toEqual([1, 2, 4])
  })

  test('Scenario: Corrupt storage is backed up and re-seeded', async ({ page }) => {
    const corrupt = '{not valid json'
    await openLogin(page)
    await seedStorage(page, { 'todo:darshan': corrupt })
    await signIn(page)
    await openTodoList(page)

    await expect(todoRows(page)).toHaveCount(3)
    await expect(page.getByTestId('todo-row-1')).toContainText('Learn React fundamentals')
    expect(await readStorage(page, 'todo-backup:darshan')).toBe(corrupt)
    const reseeded = await readJson(page, 'todo:darshan')
    expect(reseeded).toHaveLength(3)
    expect(reseeded.map((t) => t.description)).toEqual(seedTodos.map((t) => t.description))
  })
})
