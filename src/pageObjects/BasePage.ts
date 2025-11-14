import type { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly path: string;

  constructor(page: Page, path: string = '/') {
    this.page = page;
    this.path = path;
  }

  async open(): Promise<void> {
    await this.page.goto(this.path);
    await this.page.waitForLoadState('domcontentloaded');
  }
}