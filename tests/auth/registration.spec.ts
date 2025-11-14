import { test, expect } from '@playwright/test';
import { HomePage } from '../../src/pageObjects/HomePage';
import { RegistrationModal } from '../../src/components/RegistrationModal';

const VALID_PASS = 'Qwerty12!';
const BAD_PASS = 'qwe123';
const uniq = () => Date.now().toString(36);

// ---------- smoke для дому ----------

test('home is reachable', async ({ page }) => {
  const home = new HomePage(page);

  await home.openAndDismissCookie();

  await expect(page).toHaveURL(/forstudy\.space\/?$/i);
  await expect(home.signInButton).toBeVisible();
  await expect(home.signUpButton).toBeVisible();
});

// ---------- registration suite ----------

test.describe('Registration — positive & negative (POM)', () => {
  test('positive: can register a new user (redirects to Garage)', async ({ page }) => {
    const home = new HomePage(page);
    await home.openAndDismissCookie();

    const reg = await home.openRegistrationModal();

    const id = uniq();

    await reg.fillForm({
      firstName: `Alex${id}`,
      lastName: 'Test',
      email: `alex-${id}@mailinator.com`,
      password: VALID_PASS,
      repeatPassword: VALID_PASS,
    });

    await reg.acceptTermsIfPresent();
    await reg.expectSubmitEnabled();
    await reg.submit();

    await expect(page).toHaveURL(/garage/i);
    await expect(page.getByRole('heading', { name: /garage/i })).toBeVisible();
  });

  test('neg: empty submit → required errors for all fields', async ({ page }) => {
    const home = new HomePage(page);
    await home.openAndDismissCookie();

    const reg = await home.openRegistrationModal();

    // нічого не вводимо
    await reg.triggerValidationOnEmpty();
    await reg.expectSubmitDisabled();
    await reg.expectRequiredErrors();
  });

  test('neg: name length < 2 → "Name has to be from 2 to 20 characters long"', async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.openAndDismissCookie();

    const reg = await home.openRegistrationModal();

    const id = uniq();

    await reg.fillForm({
      firstName: 'A', // коротке ім’я
      lastName: 'Test',
      email: `short-${id}@mailinator.com`,
      password: VALID_PASS,
      repeatPassword: VALID_PASS,
    });

    await reg.acceptTermsIfPresent();
    await reg.expectSubmitEnabled();
    await reg.submit();

    await reg.expectNameLengthError();
  });

  test('neg: weak password is rejected', async ({ page }) => {
    const home = new HomePage(page);
    await home.openAndDismissCookie();

    const reg = await home.openRegistrationModal();

    const id = uniq();

    await reg.fillForm({
      firstName: `Alex${id}`,
      lastName: 'Test',
      email: `weak-${id}@mailinator.com`,
      password: BAD_PASS,
      repeatPassword: BAD_PASS,
    });

    await reg.acceptTermsIfPresent();
    await reg.expectSubmitEnabled();
    await reg.submit();

    await reg.expectWeakPasswordError();
  });
});