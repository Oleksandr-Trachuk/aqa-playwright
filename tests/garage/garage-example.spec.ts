import { test } from '../fixtures/userGaragePage';

test('userGaragePage: logged-in user sees Garage page', async ({ userGaragePage }) => {
  await userGaragePage.expectOnGarage();
  await userGaragePage.expectAddCarVisible();
});