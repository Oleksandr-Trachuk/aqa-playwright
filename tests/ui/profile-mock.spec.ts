import { test, expect } from '@playwright/test';

test('Профіль показує дані з підміненої відповіді', async ({ page }) => {
  // Формат відповіді ТАКИЙ САМИЙ, як у /api/Users/Profile
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

  // 1. Перехоплюємо запит профілю (регістр неважливий)
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

  // 2. Відкриваємо сторінку профілю (ти вже залогінений через setup)
  await page.goto('/panel/profile');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 3. Перевіряємо, що ми ДІЙСНО підмінили потрібний запит
  expect(intercepted).toBe(true);

  // ====== TODO: перевірка UI ======
  // Тут треба додати перевірку видимого елемента на сторінці,
  // який показує імʼя/прізвище з профілю.
  //
  // Приклад (ТІЛЬКИ ПРИКЛАД!), куди ти підставиш свій локатор:
  //
  // const nameElement = page.locator('CSS_АБО_ROLE_СЕЛЕКТОР_ДЛЯ_ІМЕНІ');
  // await expect(nameElement).toHaveText(/Oleksandr/i);
  //
  // const lastNameElement = page.locator('CSS_АБО_ROLE_СЕЛЕКТОР_ДЛЯ_ПРІЗВИЩА');
  // await expect(lastNameElement).toHaveText(/MockedUser/i);
});