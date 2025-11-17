import { test, expect } from '@playwright/test';

test('profile with changes', async ({ page }) => {
  const mockedProfile = {
    status: 'ok',
    userId: 999,
    photoFilename: null,
    name: 'Oleksandr',
    lastName: 'MockedUser',
    dateBirth: '1990-01-01T00:00:00.000Z',
    country: 'Ukraine',
  };

  let intercepted = false;

  await page.route(/\/api\/users\/profile/i, async (route) => {
    if (route.request().method() !== 'GET') {
      return route.continue();
    }

    intercepted = true;

    await route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify(mockedProfile),
    });
  });

  await page.goto('/panel/profile');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  expect(intercepted).toBe(true);

});