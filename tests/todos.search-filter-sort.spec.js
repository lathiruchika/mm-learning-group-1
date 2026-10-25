import { test, expect } from '@playwright/test'
import { seedTodos, rows, visibleDescriptions } from './helpers.js'

// EPMCDMETST-58998: search, status filter and target-date sort.

const TODOS = [
  { description: 'Write Report', targetDate: '2026-11-10', done: false },
  { description: 'Buy milk', targetDate: '2026-11-03', done: true },
  { description: 'Call mom', targetDate: '', done: false },
  { description: 'Report bugs', targetDate: '2026-11-01', done: false },
  { description: 'Milk the cow', targetDate: '2026-12-01', done: true },
]

test.describe('@EPMCDMETST-58998 search, filter and sort', () => {
  test.beforeEach(async ({ page }) => {
    await seedTodos(page, TODOS)
    await page.goto('/')
    await expect(page.getByTestId('todos-page')).toBeVisible()
    await expect(rows(page)).toHaveCount(TODOS.length)
  })

  test('search is case-insensitive and matches a substring', async ({ page }) => {
    await page.getByTestId('todo-search-input').fill('REPORT')
    await expect
      .poll(() => visibleDescriptions(page))
      .toEqual(['Write Report', 'Report bugs'])
  })

  test('search ignores leading and trailing whitespace', async ({ page }) => {
    await page.getByTestId('todo-search-input').fill('  report  ')
    await expect
      .poll(() => visibleDescriptions(page))
      .toEqual(['Write Report', 'Report bugs'])
  })

  test('a whitespace-only search shows every todo', async ({ page }) => {
    await page.getByTestId('todo-search-input').fill('   ')
    await expect(rows(page)).toHaveCount(TODOS.length)
  })

  test('a search with no matches shows the no-match empty state', async ({ page }) => {
    await page.getByTestId('todo-search-input').fill('zzz')
    await expect(page.getByTestId('todos-empty')).toHaveText('No todos match your filters.')
    await expect(page.getByTestId('todos-table')).toHaveCount(0)
  })

  test('status filter "Done" shows only completed todos', async ({ page }) => {
    await page.getByTestId('todo-status-filter').selectOption('done')
    await expect
      .poll(() => visibleDescriptions(page))
      .toEqual(['Buy milk', 'Milk the cow'])
  })

  test('status filter "Not done" shows only open todos', async ({ page }) => {
    await page.getByTestId('todo-status-filter').selectOption('not-done')
    await expect
      .poll(() => visibleDescriptions(page))
      .toEqual(['Write Report', 'Call mom', 'Report bugs'])
  })

  test('resetting search and status restores the full list', async ({ page }) => {
    await page.getByTestId('todo-search-input').fill('milk')
    await page.getByTestId('todo-status-filter').selectOption('done')
    await expect(rows(page)).toHaveCount(2)

    await page.getByTestId('todo-search-input').fill('')
    await page.getByTestId('todo-status-filter').selectOption('all')
    await expect(rows(page)).toHaveCount(TODOS.length)
  })

  test('the Clear button resets search, status and sort together', async ({ page }) => {
    await page.getByTestId('todo-search-input').fill('milk')
    await page.getByTestId('todo-status-filter').selectOption('done')
    await page.getByTestId('todo-sort-select').selectOption('date-desc')

    await page.getByTestId('todo-clear-filters-btn').click()

    await expect(page.getByTestId('todo-search-input')).toHaveValue('')
    await expect(page.getByTestId('todo-status-filter')).toHaveValue('all')
    await expect(page.getByTestId('todo-sort-select')).toHaveValue('none')
    await expect(rows(page)).toHaveCount(TODOS.length)
    await expect(page.getByTestId('todo-clear-filters-btn')).toHaveCount(0)
  })

  test('sort by target date ascending, undated todos last', async ({ page }) => {
    await page.getByTestId('todo-sort-select').selectOption('date-asc')
    await expect.poll(() => visibleDescriptions(page)).toEqual([
      'Report bugs',
      'Buy milk',
      'Write Report',
      'Milk the cow',
      'Call mom',
    ])
  })

  test('sort by target date descending, undated todos still last', async ({ page }) => {
    await page.getByTestId('todo-sort-select').selectOption('date-desc')
    await expect.poll(() => visibleDescriptions(page)).toEqual([
      'Milk the cow',
      'Write Report',
      'Buy milk',
      'Report bugs',
      'Call mom',
    ])
  })

  test('search, status filter and sort combine', async ({ page }) => {
    await page.getByTestId('todo-search-input').fill('report')
    await page.getByTestId('todo-status-filter').selectOption('not-done')
    await page.getByTestId('todo-sort-select').selectOption('date-asc')
    await expect
      .poll(() => visibleDescriptions(page))
      .toEqual(['Report bugs', 'Write Report'])
  })

  test('changing the sort keeps the active search applied', async ({ page }) => {
    await page.getByTestId('todo-search-input').fill('milk')
    await page.getByTestId('todo-sort-select').selectOption('date-desc')
    await expect
      .poll(() => visibleDescriptions(page))
      .toEqual(['Milk the cow', 'Buy milk'])
  })

  test('changing the controls does not reload the page', async ({ page }) => {
    // A full reload would discard this marker; an in-page update keeps it.
    await page.evaluate(() => {
      window.__noReloadMarker = true
    })

    await page.getByTestId('todo-search-input').fill('milk')
    await page.getByTestId('todo-status-filter').selectOption('done')
    await page.getByTestId('todo-sort-select').selectOption('date-asc')
    await expect(rows(page)).toHaveCount(2)

    expect(await page.evaluate(() => window.__noReloadMarker)).toBe(true)
  })

  test('toggling a todo while filtered updates the visible list', async ({ page }) => {
    await page.getByTestId('todo-status-filter').selectOption('not-done')
    await expect(rows(page)).toHaveCount(3)

    // "Call mom". Use click(), not check(): check() waits for the box to end up
    // checked, but this row leaves the "Not done" view as soon as it is done.
    await page.getByTestId('todo-done-checkbox-3').click()

    await expect
      .poll(() => visibleDescriptions(page))
      .toEqual(['Write Report', 'Report bugs'])
  })
})

test.describe('@EPMCDMETST-58998 empty list', () => {
  test('with no todos, shows the first-run empty state and hides the controls', async ({
    page,
  }) => {
    await seedTodos(page, [])
    await page.goto('/')
    await expect(page.getByTestId('todos-empty')).toHaveText('No todos yet. Add one above.')
    await expect(page.getByTestId('todo-list-controls')).toHaveCount(0)
  })
})
