import { test, expect } from '@playwright/test';

// NOTE: The current app does not yet include data-testid hooks. These tests use stable role/text selectors.
// When EPMCDMETST-66718 changes land (env-config + optional error banners), add data-testid selectors.

test.describe('@EPMCDMETST-66718 Env config smoke', () => {
  test('App loads the login page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('Protected route redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/list-todos');
    await expect(page).toHaveURL(/\/(login)?$/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('Login succeeds with valid demo credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('User Name:').fill('darshan');
    await page.getByLabel('Password:').fill('dummy');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/welcome\/darshan$/);
    await expect(page.getByText('Welcome darshan')).toBeVisible();
  });

  test('Login fails with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('User Name:').fill('wrong');
    await page.getByLabel('Password:').fill('creds');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Authentication Failed')).toBeVisible();
    await expect(page).toHaveURL(/\/(login)?$/);
  });
});
