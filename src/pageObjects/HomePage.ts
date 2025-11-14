import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { RegistrationModal } from '../components/RegistrationModal';

export class HomePage extends BasePage {
  readonly signInButton: Locator;
  readonly signUpButton: Locator;
  readonly cookieAcceptButton: Locator;

  constructor(page: Page) {
    super(page, '/'); // baseURL у playwright.config.ts
    this.signInButton = page.getByRole('button', { name: /sign in/i });
    this.signUpButton = page
      .getByRole('button', { name: /sign up/i })
      .or(page.getByRole('link', { name: /sign up/i }))
      .first();

    this.cookieAcceptButton = page
      .getByRole('button', { name: /accept|ok|agree|got it/i })
      .first();
  }

  async openAndDismissCookie(): Promise<void> {
    await this.open();
    await this.dismissCookieIfAny();
  }

  async dismissCookieIfAny(): Promise<void> {
    try {
      if (await this.cookieAcceptButton.isVisible({ timeout: 2000 })) {
        await this.cookieAcceptButton.click();
      }
    } catch {
      // банера може не бути — це ок
    }
  }

  async openRegistrationModal(): Promise<RegistrationModal> {
    await expect(this.signUpButton).toBeVisible();
    await this.signUpButton.click();

    const modal = new RegistrationModal(this.page);
    await modal.waitForOpened();
    return modal;
  }
}