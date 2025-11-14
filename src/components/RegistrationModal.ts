import { expect, type Locator, type Page } from '@playwright/test';

export class RegistrationModal {
  readonly page: Page;
  readonly dialog: Locator;
  readonly form: Locator;

  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly repeatPasswordInput: Locator;
  readonly termsCheckbox: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.dialog = page
      .getByRole('dialog')
      .filter({
        has: page.getByRole('heading', { name: /registration|sign up/i }),
      })
      .first();

    this.form = this.dialog.locator('form').first();

    // ⬇️ ЦІ локатори потім при бажанні можна взяти з codegen
    this.firstNameInput = this.form.getByPlaceholder(/name/i).first();
    this.lastNameInput = this.form.getByPlaceholder(/last name/i);
    this.emailInput = this.form.getByPlaceholder(/email/i);
    this.passwordInput = this.form.getByPlaceholder(/password/i).first();
    this.repeatPasswordInput = this.form.getByPlaceholder(/password/i).nth(1);

    this.termsCheckbox = this.form.locator('input[type="checkbox"]').first();

    this.submitButton = this.form
      .getByRole('button', { name: /register|sign up/i })
      .first();
  }

  async waitForOpened(): Promise<void> {
    await expect(this.dialog).toBeVisible();
  }

  async fillForm(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    repeatPassword?: string;
  }): Promise<void> {
    if (data.firstName !== undefined) {
      await this.firstNameInput.fill(data.firstName);
    }
    if (data.lastName !== undefined) {
      await this.lastNameInput.fill(data.lastName);
    }
    if (data.email !== undefined) {
      await this.emailInput.fill(data.email);
    }
    if (data.password !== undefined) {
      await this.passwordInput.fill(data.password);
    }
    if (data.repeatPassword !== undefined) {
      await this.repeatPasswordInput.fill(data.repeatPassword);
    }
  }

  async acceptTermsIfPresent(): Promise<void> {
    try {
      if (await this.termsCheckbox.isVisible({ timeout: 1000 })) {
        await this.termsCheckbox.check({ force: true });
      }
    } catch {
      // якщо немає чекбокса — ігноруємо
    }
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async expectSubmitEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
  }

  async expectSubmitDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }

  async triggerValidationOnEmpty(): Promise<void> {
    // фокус/блюр по полях, щоб з'явилися "required"
    for (const field of [
      this.firstNameInput,
      this.lastNameInput,
      this.emailInput,
      this.passwordInput,
      this.repeatPasswordInput,
    ]) {
      await field.focus();
      await field.blur();
    }
  }

  // ------ errors helpers ------

  private get errorMessages(): Locator {
    return this.form.locator(
      '.invalid-feedback, .text-danger, .text-error, .invalid',
    );
  }

  async expectRequiredErrors(): Promise<void> {
    await expect(this.errorMessages.filter({ hasText: /required/i })).toBeVisible();
  }

  async expectNameLengthError(): Promise<void> {
    await expect(
      this.errorMessages.filter({ hasText: /name.*2 to 20/i }),
    ).toBeVisible();
  }

  async expectWeakPasswordError(): Promise<void> {
    await expect(
      this.errorMessages.filter({ hasText: /password.*(too weak|at least)/i }),
    ).toBeVisible();
  }
}