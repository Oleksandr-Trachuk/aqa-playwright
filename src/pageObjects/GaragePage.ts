import { Page, Locator, expect } from '@playwright/test';

export class GaragePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  async open(): Promise<void> {
    await this.page.goto('/panel/garage');
    await this.waitLoaded();
  }

  async waitLoaded(): Promise<void> {
    await this.page.waitForURL(/\/panel\/garage/i);

    // 2) шукаємо заголовок Garage
    const headingCandidate = this.page
      .getByRole('heading', { name: /garage/i })
      .or(this.page.getByText(/garage/i));

    await headingCandidate.first().waitFor();

    await expect(this.page).not.toHaveURL(/https:\/\/qauto\.forstudy\.space\/$/i);
  }

  async isLoaded(): Promise<void> {
    await this.waitLoaded();
  }

  get addCarButton(): Locator {
    return this.page.getByRole('button', { name: /add car/i });
  }
  async expectOnGarage(): Promise<void> {
    await this.isLoaded();
  }

  async expectAddCarVisible(): Promise<void> {
    await expect(this.addCarButton).toBeVisible();
  }
}
