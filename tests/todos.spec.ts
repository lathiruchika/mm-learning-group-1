import { test, expect } from '@playwright/test';

const DEMO_USER = 'darshan';
const DEMO_PASS = 'dummy';

async function login(page) {
  await page.goto('/login');
  await page.getByLabel('User Name:').fill(DEMO_USER);
  await page.getByLabel('Password:').fill(DEMO_PASS);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(new RegExp(`/welcome/${DEMO_USER}$`));
}

test.describe('Todos (dummy-mode ready)', () => {
  test('@EPMCDMETST-69689 unauthenticated user redirected from /list-todos', async ({ page }) => {
    await page.goto('/list-todos');
    await expect(page).toHaveURL(/\/(login)?$/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('@EPMCDMETST-69689 list todos page loads after login', async ({ page }) => {
    await login(page);
    await page.goto('/list-todos');
    await expect(page.getByRole('heading', { name: 'List of Todos' })).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('@EPMCDMETST-69646 @EPMCDMETST-69649 create todo shows in list (via backend or dummy)', async ({ page }) => {
    await login(page);
    await page.goto('/list-todos');

    await page.getByText('Add New Todo').click();
    await expect(page).toHaveURL(/\/list-todos\/-1$/);

    const description = `Buy groceries ${Date.now()}`;
    await page.getByLabel('Description').fill(description);
    await page.getByLabel('TargetDate').fill('2030-01-01');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL(/\/list-todos$/);
    await expect(page.getByRole('cell', { name: description })).toBeVisible();
  });

  test('@EPMCDMETST-69655 delete todo removes row (best-effort)', async ({ page }) => {
    await login(page);
    await page.goto('/list-todos');

    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    test.skip(rowCount === 0, 'No todos to delete');

    const firstRow = rows.first();
    const firstDescription = await firstRow.locator('td').first().innerText();
    await firstRow.getByRole('button', { name: 'Delete' }).click();

    // After delete, page shows a message and refreshes.
    await expect(page.getByText(/is deleted\./)).toBeVisible();
    await expect(page.getByRole('cell', { name: firstDescription })).not.toBeVisible();
  });

  test('@EPMCDMETST-69660 validation: short description shows error', async ({ page }) => {
    await login(page);
    await page.goto('/list-todos/-1');

    await page.getByLabel('Description').fill('short');
    await page.getByLabel('TargetDate').fill('2030-01-01');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText(/Enter atlease 8 characters/i)).toBeVisible();
  });
});
