import {
  test,
  expect,
  openLogin,
  signIn,
  startSession,
  startOnList,
  navigateInApp,
  todoRows,
  seedTodos,
} from '../support/app.js'

// Mirrors e2e/features/auth-navigation.feature (EPMCDMETST-70470).

const loginInput = (page) => page.locator('input[name="username"]')
const navLink = (page, name) => page.getByRole('navigation').getByRole('link', { name })
const ENDS_WITH_SLASH = /\/$/

async function expectOnLoginPage(page) {
  await expect(page).toHaveURL(ENDS_WITH_SLASH)
  await expect(loginInput(page)).toBeVisible()
}

test.describe('Feature: Login, logout and navigation', () => {
  test.beforeEach(async ({ page }) => {
    await openLogin(page)
  })

  // Scenario Outline: Wrong credentials keep the user on the login page
  const wrongCredentials = [
    { name: 'wrong password', username: 'darshan', password: 'wrong' },
    { name: 'unknown user', username: 'someone', password: 'dummy' },
    { name: 'user name is case sensitive', username: 'Darshan', password: 'dummy' },
    { name: 'empty credentials', username: '', password: '' },
  ]
  for (const example of wrongCredentials) {
    test(`Scenario Outline: Wrong credentials keep the user on the login page (${example.name})`, async ({ page }) => {
      await signIn(page, example.username, example.password)

      await expectOnLoginPage(page)
      await expect(navLink(page, 'LogOut')).toHaveCount(0)
      await expect(navLink(page, 'Yours Todo Lists')).toHaveCount(0)
      await expect(navLink(page, 'Home')).toHaveCount(0)
    })
  }

  test('Scenario: Wrong credentials show an Authentication Failed message', async ({ page }) => {
    test.fixme(
      true,
      'App bug: src/components/Login.jsx:27 calls authContext.setAuthenticated, which AuthProvider.jsx:32 does not expose, so it throws a TypeError before setShowErrorMessage(true) on line 28 and no error is ever shown.',
    )

    await signIn(page, 'darshan', 'wrong')

    await expect(page.getByText('Authentication Failed')).toBeVisible()
    await expectOnLoginPage(page)
  })

  test('Scenario: A correct login after a failed attempt lands on the welcome page', async ({ page }) => {
    await signIn(page, 'darshan', 'wrong')
    await expectOnLoginPage(page)

    await signIn(page)

    await expect(page).toHaveURL(/\/welcome\/darshan$/)
    await expect(page.getByRole('heading', { name: 'Hi, darshan' })).toBeVisible()
  })

  test('Scenario: A correct login lands on the welcome page for darshan', async ({ page }) => {
    await signIn(page)

    await expect(page).toHaveURL(/\/welcome\/darshan$/)
    await expect(page.getByRole('heading', { name: 'Hi, darshan' })).toBeVisible()
    await expect(navLink(page, 'Home')).toBeVisible()
    await expect(navLink(page, 'Yours Todo Lists')).toBeVisible()
    await expect(navLink(page, 'LogOut')).toBeVisible()
    await expect(navLink(page, 'LogIn')).toHaveCount(0)
  })

  test('Scenario: Logging out returns to the login page and protected pages are closed again', async ({ page }) => {
    await startOnList(page)

    await navLink(page, 'LogOut').click()

    // The /logout route is protected and the session is already cleared when it renders,
    // so the app ends on the login page (the "You are Logged Out" screen is never shown).
    await expectOnLoginPage(page)
    await expect(navLink(page, 'LogIn')).toBeVisible()
    await expect(navLink(page, 'LogOut')).toHaveCount(0)

    await navigateInApp(page, '/list-todos')

    await expectOnLoginPage(page)
    await expect(todoRows(page)).toHaveCount(0)
  })

  // Scenario Outline: A protected page redirects to the login page when logged out
  for (const path of ['/welcome/darshan', '/list-todos', '/list-todos/-1', '/list-todos/1', '/logout']) {
    test(`Scenario Outline: A protected page redirects to the login page when logged out (${path})`, async ({ page }) => {
      await page.goto(path)

      await expectOnLoginPage(page)
      await expect(todoRows(page)).toHaveCount(0)
      await expect(page.getByTestId('todo-form')).toHaveCount(0)
    })
  }

  test('Scenario: Reloading a protected page logs the user out', async ({ page }) => {
    await startOnList(page)
    await expect(todoRows(page)).toHaveCount(3)

    await page.reload()

    await expectOnLoginPage(page)
    await expect(todoRows(page)).toHaveCount(0)
  })

  test('Scenario: Header and welcome links move between the pages', async ({ page }) => {
    await startSession(page)

    await navLink(page, 'Yours Todo Lists').click()
    await expect(page).toHaveURL(/\/list-todos$/)

    await navLink(page, 'Home').click()
    await expect(page).toHaveURL(/\/welcome\/darshan$/)

    await page.getByRole('link', { name: 'here' }).click()
    await expect(page).toHaveURL(/\/list-todos$/)
    await expect(page.getByTestId('todo-row-1')).toBeVisible()
  })

  test('Scenario: The Add New Todo button opens an empty create form', async ({ page }) => {
    await startOnList(page)
    await expect(todoRows(page)).toHaveCount(3)

    await page.getByTestId('todo-add-cta').click()

    await expect(page).toHaveURL(/\/list-todos\/-1$/)
    await expect(page.getByTestId('todo-form')).toBeVisible()
    await expect(page.getByTestId('todo-field-description')).toHaveValue('')
    await expect(page.getByTestId('todo-field-targetDate')).toHaveValue('')
    await expect(page.getByTestId('todo-field-done')).not.toBeChecked()
    await expect(page.getByTestId('todo-save')).toBeDisabled()
  })

  // Scenario Outline: Update opens the edit form with the values of the todo prefilled
  const prefilled = [
    { todo: seedTodos[0], checked: false },
    { todo: seedTodos[2], checked: true },
  ]
  for (const { todo, checked } of prefilled) {
    test(`Scenario Outline: Update opens the edit form with the values of the todo prefilled (id ${todo.id}, done ${checked})`, async ({ page }) => {
      await startOnList(page, { 'todo:darshan': seedTodos })

      await page.getByTestId(`todo-edit-${todo.id}`).click()

      await expect(page).toHaveURL(new RegExp(`/list-todos/${todo.id}$`))
      await expect(page.getByTestId('todo-form')).toBeVisible()
      await expect(page.getByTestId('todo-field-description')).toHaveValue(todo.description)
      await expect(page.getByTestId('todo-field-targetDate')).toHaveValue(todo.targetDate)
      await expect(page.getByTestId('todo-field-done')).toBeChecked({ checked })
    })
  }

  test('Scenario: An unknown address shows the 404 page', async ({ page }) => {
    await page.goto('/no-such-page')

    await expect(page.getByRole('heading', { name: '404 NOT FOUND' })).toBeVisible()
  })
})
