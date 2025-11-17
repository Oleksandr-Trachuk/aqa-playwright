import { test as setup, expect } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';

const USER_EMAIL = process.env.QAUTO_USER_EMAIL!;
const USER_PASSWORD = process.env.QAUTO_USER_PASSWORD!;

setup.describe('auth setup', () => {
  setup('auth: login and save storage state', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await page.getByRole('button', { name: /sign in/i }).click();

    const dialog = page
      .getByRole('dialog')
      .filter({
        has: page.getByRole('heading', { name: /sign in|log in/i }),
      })
      .first();

    await expect(dialog).toBeVisible();
    const emailInput = dialog.locator(
      'input[type="email"], input[name="email"], input[formcontrolname="email"]',
    );
    const passwordInput = dialog.locator(
      'input[type="password"], input[name="password"], input[formcontrolname="password"]',
    );

    await emailInput.fill(USER_EMAIL);
    await passwordInput.fill(USER_PASSWORD);

    await dialog.getByRole('button', { name: /login|sign in/i }).click();

    await page.waitForURL(/\/garage/i);
    await expect(page.getByRole('heading', { name: /garage/i })).toBeVisible();

    await page.context().storageState({ path: AUTH_FILE });
  });
});