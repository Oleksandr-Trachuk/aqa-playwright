import { test, expect } from '../fixtures/userGaragePage';

test.describe('Garage with authenticated user', () => {
  test('userGaragePage opens Garage and shows heading', async ({
    userGaragePage,
  }) => {
    await userGaragePage.isLoaded();

    await expect(userGaragePage.addCarButton).toBeVisible();
  });
});