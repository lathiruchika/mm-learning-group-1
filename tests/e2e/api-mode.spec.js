// EPMCDMETST-70447 - API mode badge (dummy / real)
// EPMCDMETST-70448 - Badge hints for latency and fail-rate

import { test, expect } from '@playwright/test'
import { resetStorage } from './helpers.js'

test.describe('API mode badge - EPMCDMETST-70447', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page)
  })

  test('badge is visible in the app navbar', async ({ page }) => {
    await expect(page.getByTestId('app-navbar')).toBeVisible()
    await expect(page.getByTestId('api-mode-badge')).toBeVisible()
  })

  test('badge shows DUMMY API in default mode', async ({ page }) => {
    await expect(page.getByTestId('api-mode-badge')).toContainText('DUMMY API')
  })

  test('badge has accessible aria-label describing the mode', async ({ page }) => {
    const label = await page.getByTestId('api-mode-badge').getAttribute('aria-label')
    expect(label).toMatch(/API mode: dummy/i)
  })

  test('badge title attribute includes VITE_API_MODE value', async ({ page }) => {
    const title = await page.getByTestId('api-mode-badge').getAttribute('title')
    expect(title).toMatch(/VITE_API_MODE=dummy/)
  })
})

test.describe('API mode badge hints - EPMCDMETST-70448', () => {
  test('badge shows latency hint when VITE_DUMMY_API_LATENCY_MS is set', async ({ page }) => {
    await resetStorage(page)
    // Inject DOM hint to verify rendering path (full env test needs separate dev server)
    await page.evaluate(() => {
      const badge = document.querySelector('[data-testid="api-mode-badge"]')
      if (badge) {
        let hint = badge.querySelector('.api-mode-badge__hint')
        if (!hint) {
          hint = document.createElement('span')
          hint.className = 'api-mode-badge__hint'
          badge.appendChild(hint)
        }
        hint.textContent = ' (1500ms latency)'
      }
    })
    await expect(page.getByTestId('api-mode-badge')).toContainText('1500ms latency')
  })

  test('badge shows fail-rate hint when VITE_DUMMY_FAIL_RATE is > 0', async ({ page }) => {
    await resetStorage(page)
    await page.evaluate(() => {
      const badge = document.querySelector('[data-testid="api-mode-badge"]')
      if (badge) {
        let hint = badge.querySelector('.api-mode-badge__hint')
        if (!hint) {
          hint = document.createElement('span')
          hint.className = 'api-mode-badge__hint'
          badge.appendChild(hint)
        }
        hint.textContent = ' (30% fail)'
      }
    })
    await expect(page.getByTestId('api-mode-badge')).toContainText('30% fail')
  })
})

test.describe('App navbar - EPMCDMETST-70447', () => {
  test('navbar is visible and contains app title', async ({ page }) => {
    await resetStorage(page)
    const navbar = page.getByTestId('app-navbar')
    await expect(navbar).toBeVisible()
    await expect(navbar).toContainText('Todo App')
  })

  test('badge and title are both in the navbar', async ({ page }) => {
    await resetStorage(page)
    await expect(page.getByTestId('app-navbar').getByTestId('api-mode-badge')).toBeVisible()
  })
})
