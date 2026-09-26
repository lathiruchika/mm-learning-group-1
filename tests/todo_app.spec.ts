import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

async function gotoLogin(page: any) {
  await page.goto(`${BASE_URL}/`);
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
}

async function login(page: any, username: string, password: string) {
  await gotoLogin(page);
  await page.getByLabel('User Name:').fill(username);
  await page.getByLabel('Password:').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
}

test.describe('EPMCDMETST Todo App', () => {
  test('EPMCDMETST-101: successful login navigates to welcome', async ({ page }) => {
    await login(page, 'darshan', 'dummy');

    await expect(page.getByRole('heading', { name: "Welcome, let's get started" })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Hi, darshan' })).toBeVisible();

    await expect(page.getByRole('link', { name: 'Yours Todo Lists' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'LogOut' })).toBeVisible();
  });

  test('EPMCDMETST-101: invalid login shows error and stays on login', async ({ page }) => {
    await login(page, 'darshan', 'wrong');

    await expect(page.getByText('Authentication Failed')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();

    // Ensure we did not navigate to welcome
    await expect(page.getByRole('heading', { name: "Welcome, let's get started" })).toHaveCount(0);
  });

  test('EPMCDMETST-101: unauthenticated access to /list-todos redirects to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/list-todos`);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('EPMCDMETST-102: navigate to list todos from welcome', async ({ page }) => {
    await login(page, 'darshan', 'dummy');

    // "Check your todo here" link
    await page.getByRole('link', { name: 'here' }).click();
    await expect(page.getByRole('heading', { name: 'List of Todos' })).toBeVisible();
  });

  test('EPMCDMETST-103: add todo validation - description too short', async ({ page }) => {
    await login(page, 'darshan', 'dummy');

    await page.goto(`${BASE_URL}/list-todos/-1`);
    await expect(page.getByRole('heading', { name: 'Enter your Todo Details:' })).toBeVisible();

    await page.getByLabel('Description').fill('short');
    await page.getByLabel('TargetDate').fill('2030-12-31');

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Enter atlease 8 characters for description')).toBeVisible();
  });

  test('EPMCDMETST-103: add todo validation - missing target date', async ({ page }) => {
    await login(page, 'darshan', 'dummy');

    await page.goto(`${BASE_URL}/list-todos/-1`);
    await expect(page.getByRole('heading', { name: 'Enter your Todo Details:' })).toBeVisible();

    await page.getByLabel('Description').fill('A valid description');

    // For input[type=date], clearing is platform-specific; set to empty via evaluate to avoid flakiness
    const dateInput = page.getByLabel('TargetDate');
    await dateInput.fill('2030-12-31');
    await page.evaluate(() => {
      const el = document.querySelector('input[name="targetDate"]') as HTMLInputElement | null;
      if (el) el.value = '';
    });

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Please enter a date')).toBeVisible();
  });
});
