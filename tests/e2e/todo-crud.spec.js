// EPMCDMETST-70446 — Dummy API CRUD (localStorage persist, seed dataset, correct shape)
// EPMCDMETST-70451 — Form load/save/error states (covered alongside CRUD)

import { test, expect } from '@playwright/test'
import { seedTodos, clearStorage, DEFAULT_TODOS } from './helpers.js'

test.describe('Todo CRUD — EPMCDMETST-70446', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
    await page.goto('/')
  })

  // ── Seeding ────────────────────────────────────────────────────────────────
  test('first run seeds 3 default todos', async ({ page }) => {
    await expect(page.getByTestId('todos-table')).toBeVisible()
    await expect(page.getByTestId('todo-row-1')).toBeVisible()
    await expect(page.getByTestId('todo-row-2')).toBeVisible()
    await expect(page.getByTestId('todo-row-3')).toBeVisible()
  })

  test('seeded todos persist across page reload', async ({ page }) => {
    await expect(page.getByTestId('todos-table')).toBeVisible()
    await page.reload()
    await expect(page.getByTestId('todos-table')).toBeVisible()
    await expect(page.getByTestId('todo-row-1')).toBeVisible()
  })

  // ── Create ─────────────────────────────────────────────────────────────────
  test('creates a new todo and appends it to the list', async ({ page }) => {
    await expect(page.getByTestId('todos-table')).toBeVisible()

    await page.getByTestId('todoform-description').fill('Write Playwright tests now')
    await page.getByTestId('todoform-target-date').fill('2026-11-20')
    await page.getByTestId('todoform-submit').click()

    await expect(page.getByTestId('todos-table')).toContainText('Write Playwright tests now')
  })

  test('new todo persists after page reload', async ({ page }) => {
    await expect(page.getByTestId('todos-table')).toBeVisible()

    await page.getByTestId('todoform-description').fill('Persistent new todo item')
    await page.getByTestId('todoform-target-date').fill('2026-12-01')
    await page.getByTestId('todoform-submit').click()
    await expect(page.getByTestId('todos-table')).toContainText('Persistent new todo item')

    await page.reload()
    await expect(page.getByTestId('todos-table')).toContainText('Persistent new todo item')
  })

  test('form resets to empty after successful create', async ({ page }) => {
    await expect(page.getByTestId('todos-table')).toBeVisible()

    await page.getByTestId('todoform-description').fill('Another brand new task')
    await page.getByTestId('todoform-target-date').fill('2026-11-25')
    await page.getByTestId('todoform-submit').click()

    await expect(page.getByTestId('todoform-description')).toHaveValue('')
    await expect(page.getByTestId('todoform-target-date')).toHaveValue('')
  })

  // ── Edit ───────────────────────────────────────────────────────────────────
  test('clicking Edit pre-fills form with todo data', async ({ page }) => {
    await expect(page.getByTestId('todo-edit-1')).toBeVisible()
    await page.getByTestId('todo-edit-1').click()

    await expect(page.getByTestId('todoform-description')).not.toHaveValue('')
    await expect(page.getByTestId('todoform-target-date')).not.toHaveValue('')
    await expect(page.getByTestId('todoform-done')).toBeVisible()
    await expect(page.getByTestId('todoform-cancel')).toBeVisible()
  })

  test('updates todo description and persists after reload', async ({ page }) => {
    await expect(page.getByTestId('todo-edit-1')).toBeVisible()
    await page.getByTestId('todo-edit-1').click()

    await page.getByTestId('todoform-description').fill('Buy groceries for next two weeks')
    await page.getByTestId('todoform-submit').click()

    await expect(page.getByTestId('todos-table')).toContainText('Buy groceries for next two weeks')

    await page.reload()
    await expect(page.getByTestId('todos-table')).toContainText('Buy groceries for next two weeks')
  })

  test('Cancel in edit mode returns to add mode', async ({ page }) => {
    await page.getByTestId('todo-edit-1').click()
    await expect(page.getByTestId('todoform-cancel')).toBeVisible()

    await page.getByTestId('todoform-cancel').click()

    await expect(page.getByTestId('todoform-done')).not.toBeVisible()
    await expect(page.getByTestId('todoform-cancel')).not.toBeVisible()
    await expect(page.getByTestId('todoform-submit')).toContainText('Add Todo')
  })

  // ── Delete ─────────────────────────────────────────────────────────────────
  test('deletes a todo and removes it from the list', async ({ page }) => {
    await seedTodos(page, DEFAULT_TODOS)
    await page.goto('/')

    await expect(page.getByTestId('todo-row-2')).toBeVisible()
    await page.getByTestId('todo-delete-2').click()

    await expect(page.getByTestId('todo-row-2')).not.toBeVisible()
  })

  test('deleted todo does not reappear after reload', async ({ page }) => {
    await seedTodos(page, DEFAULT_TODOS)
    await page.goto('/')

    await page.getByTestId('todo-delete-2').click()
    await expect(page.getByTestId('todo-row-2')).not.toBeVisible()

    await page.reload()
    await expect(page.getByTestId('todo-row-2')).not.toBeVisible()
  })

  // ── Validation ─────────────────────────────────────────────────────────────
  test('shows description error when submitting with fewer than 8 chars', async ({ page }) => {
    await page.getByTestId('todoform-description').fill('short')
    await page.getByTestId('todoform-target-date').fill('2026-11-15')
    await page.getByTestId('todoform-submit').click()

    await expect(page.getByTestId('todoform-description-error'))
      .toContainText('Description must be at least 8 characters')
  })

  test('shows target date error when submitting without a date', async ({ page }) => {
    await page.getByTestId('todoform-description').fill('A valid description here')
    await page.getByTestId('todoform-submit').click()

    await expect(page.getByTestId('todoform-target-date-error'))
      .toContainText('Target date is required')
  })

  test('shows both validation errors when form is completely empty', async ({ page }) => {
    await page.getByTestId('todoform-submit').click()

    await expect(page.getByTestId('todoform-description-error')).toBeVisible()
    await expect(page.getByTestId('todoform-target-date-error')).toBeVisible()
  })

  test('clears field error when user starts typing', async ({ page }) => {
    await page.getByTestId('todoform-submit').click()
    await expect(page.getByTestId('todoform-description-error')).toBeVisible()

    await page.getByTestId('todoform-description').fill('Now I am typing')
    await expect(page.getByTestId('todoform-description-error')).not.toBeVisible()
  })
})
