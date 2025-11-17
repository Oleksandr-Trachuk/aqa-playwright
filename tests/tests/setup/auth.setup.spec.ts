import { test as setup, expect } from '@playwright/test';

setup.describe('auth setup', () => {
  setup('auth: login and save storage state', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('domcontentloaded');

    // joginflow
    await page.getByRole('button', { name: /sign in/i }).click();

    const email = process.env.QAUTO_USER_EMAIL || '';
    const password = process.env.QAUTO_USER_PASSWORD || '';

    console.log('QAUTO_USER_EMAIL:', email ? 'DEFINED' : 'EMPTY');
    console.log('QAUTO_USER_PASSWORD:', password ? 'DEFINED' : 'EMPTY');

    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);

    const loginButton = page.getByRole('button', { name: /login|sign in/i });

    await expect(loginButton).toBeEnabled();

    await loginButton.click();

    await page.waitForURL('**/panel/**');

    await page.context().storageState({ path: 'playwright/.auth/user.json' });
  });
});