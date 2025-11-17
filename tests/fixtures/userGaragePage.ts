import { test as base, expect } from '@playwright/test';
import { GaragePage } from '../../src/pageObjects/GaragePage';

type Fixtures = {
  userGaragePage: GaragePage;
};

export const test = base.extend<Fixtures>({
  userGaragePage: async ({ browser }, use) => {
    const BASE_URL = process.env.BASE_URL!;
    const HTTP_USERNAME = process.env.HTTP_USERNAME!;
    const HTTP_PASSWORD = process.env.HTTP_PASSWORD!;

    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
      baseURL: BASE_URL,
      httpCredentials: {
        username: HTTP_USERNAME,
        password: HTTP_PASSWORD,
      },
    });

    const page = await context.newPage();
    const garagePage = new GaragePage(page);

    await garagePage.open();

    await use(garagePage);

    await context.close();
  },
});

export { expect };