// EPMCDMETST-70449 — Loading + empty states
// EPMCDMETST-70450 — Per-row delete progress, success message, inline error
// EPMCDMETST-70451 — Form save error (values retained)
//
// Failure injection strategy:
//   window.__PW_DUMMY_FAIL = true  — set via page.evaluate() AFTER initial load
//   so the page seeds and renders normally; only subsequent API calls fail.
//   Set via page.addInitScript() BEFORE goto to make the very first fetch fail.

import { test, expect } from '@playwright/test'
import { seedTodos, resetStorage, DEFAULT_TODOS } from './helpers.js'

// ── Empty state — EPMCDMETST-70449 ───────────────────────────────────────────
test.describe('Empty state — EPMCDMETST-70449', () => {
  test('shows empty state when todos list is empty', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('mm.todos.v1', '[]')
      localStorage.setItem('mm.todos.meta.v1', JSON.stringify({
        nextId: 100, seededAt: new Date().toISOString(), schemaVersion: 1,
      }))
    })
    await page.goto('/')

    await expect(page.getByTestId('todos-empty')).toBeVisible()
    await expect(page.getByTestId('todos-add')).toBeVisible()
    await expect(page.getByTestId('todos-table')).not.toBeVisible()
  })

  test('"Add your first todo" CTA shows the form', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('mm.todos.v1', '[]')
      localStorage.setItem('mm.todos.meta.v1', JSON.stringify({
        nextId: 100, seededAt: new Date().toISOString(), schemaVersion: 1,
      }))
    })
    await page.goto('/')

    await page.getByTestId('todos-add').click()
    await expect(page.getByTestId('todo-form')).toBeVisible()
  })
})

// ── Loading state — EPMCDMETST-70449 ─────────────────────────────────────────
test.describe('Loading state — EPMCDMETST-70449', () => {
  test('todos table is visible after app loads', async ({ page }) => {
    await resetStorage(page)
    await expect(page.getByTestId('todos-table')).toBeVisible({ timeout: 5000 })
  })
})

// ── Error state — EPMCDMETST-70448/70449 ─────────────────────────────────────
test.describe('Error state — EPMCDMETST-70448 / 70449', () => {
  test('shows error banner when fetch fails on first load', async ({ page }) => {
    // Inject failure BEFORE page load so the initial getTodos throws.
    await page.addInitScript(() => { window.__PW_DUMMY_FAIL = true })
    await page.goto('/')

    await expect(page.getByTestId('todos-error-banner')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('todos-table')).not.toBeVisible()
  })

  test('error banner contains a Retry button', async ({ page }) => {
    await page.addInitScript(() => { window.__PW_DUMMY_FAIL = true })
    await page.goto('/')

    await expect(page.getByTestId('todos-error-banner')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('todos-error-banner-retry')).toBeVisible()
  })

  test('Retry re-attempts the fetch and still shows error when still failing', async ({ page }) => {
    await page.addInitScript(() => { window.__PW_DUMMY_FAIL = true })
    await page.goto('/')

    await expect(page.getByTestId('todos-error-banner')).toBeVisible({ timeout: 5000 })
    await page.getByTestId('todos-error-banner-retry').click()
    await expect(page.getByTestId('todos-error-banner')).toBeVisible({ timeout: 5000 })
  })
})

// ── Per-row delete — EPMCDMETST-70450 ────────────────────────────────────────
test.describe('Per-row delete — EPMCDMETST-70450', () => {
  test.beforeEach(async ({ page }) => {
    await seedTodos(page, DEFAULT_TODOS)
    await page.goto('/')
    await expect(page.getByTestId('todos-table')).toBeVisible()
  })

  test('delete button removes the row after success message clears', async ({ page }) => {
    await page.getByTestId('todo-delete-2').click()
    // Row stays briefly for success message, then disappears
    await expect(page.getByTestId('todo-row-2')).not.toBeVisible({ timeout: 5000 })
  })

  test('shows transient success message in the row after delete', async ({ page }) => {
    await page.getByTestId('todo-delete-1').click()
    // Row remains with success badge while TTL counts down
    await expect(page.getByTestId('todo-row-1').locator('.delete-success')).toBeVisible({ timeout: 2000 })
  })

  test('other rows remain usable after a delete', async ({ page }) => {
    await page.getByTestId('todo-delete-2').click()
    await expect(page.getByTestId('todo-row-2')).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('todo-delete-1')).toBeEnabled()
    await expect(page.getByTestId('todo-delete-3')).toBeEnabled()
  })

  test('delete error shows inline when operation fails', async ({ page }) => {
    // Let initial load complete, then inject failure for subsequent calls
    await page.evaluate(() => { window.__PW_DUMMY_FAIL = true })

    await page.getByTestId('todo-delete-2').click()
    await expect(page.getByTestId('todo-delete-error-2')).toBeVisible({ timeout: 3000 })
    // Row must still be present on error
    await expect(page.getByTestId('todo-row-2')).toBeVisible()
  })

  test('inline delete error can be dismissed', async ({ page }) => {
    await page.evaluate(() => { window.__PW_DUMMY_FAIL = true })

    await page.getByTestId('todo-delete-2').click()
    await expect(page.getByTestId('todo-delete-error-2')).toBeVisible({ timeout: 3000 })

    await page.getByTestId('todo-delete-error-2').getByText('dismiss').click()
    await expect(page.getByTestId('todo-delete-error-2')).not.toBeVisible()
  })
})

// ── Form save error — EPMCDMETST-70451 ───────────────────────────────────────
test.describe('Form save error — EPMCDMETST-70451', () => {
  test('save failure shows error banner and retains typed values', async ({ page }) => {
    await seedTodos(page, DEFAULT_TODOS)
    await page.goto('/')
    await expect(page.getByTestId('todos-table')).toBeVisible()

    // Inject failure AFTER load so the form renders normally, but save will fail
    await page.evaluate(() => { window.__PW_DUMMY_FAIL = true })

    await page.getByTestId('todoform-description').fill('A perfectly valid todo description')
    await page.getByTestId('todoform-target-date').fill('2026-11-30')
    await page.getByTestId('todoform-submit').click()

    await expect(page.getByTestId('todoform-error-banner')).toBeVisible({ timeout: 3000 })
    // Values must be retained so user doesn't lose their work
    await expect(page.getByTestId('todoform-description'))
      .toHaveValue('A perfectly valid todo description')
    await expect(page.getByTestId('todoform-target-date')).toHaveValue('2026-11-30')
  })
})
