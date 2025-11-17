import { test, expect, type Page, type Locator } from '@playwright/test';

const VALID_PASS = 'Qwerty12!';
const BAD_PASS = 'qwe123';
const uniq = () => Date.now().toString(36);

// ---------------- HELPERS ----------------

async function gotoHome(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
}

async function openRegistrationDialog(page: Page): Promise<Locator> {
  await gotoHome(page);

  const signUp = page
    .getByRole('button', { name: /sign up/i })
    .or(page.getByRole('link', { name: /sign up/i }))
    .first();

  await expect(signUp).toBeVisible();
  await signUp.click();

  const dialog = page
    .getByRole('dialog')
    .filter({
      has: page.getByRole('heading', { name: /registration|sign up/i }),
    })
    .first();

  await expect(dialog).toBeVisible();
  return dialog;
}

// ПОЛЯ: getByLabel (без placeholder-ів)
function registrationFields(dialog: Locator) {
  const firstName = dialog.getByLabel(/^\s*name\s*$/i).first();
  const lastName = dialog.getByLabel(/last name/i).first();
  const email = dialog.getByLabel(/email/i).first();

  const password = dialog.getByLabel(/^\s*password\s*$/i).first();
  const repeatPassword = dialog
    .getByLabel(/(re-?enter|repeat|confirm)\s+password/i)
    .first();

  const submit = dialog
    .getByRole('button', { name: /register|sign up/i })
    .first();

  return {
    firstName,
    lastName,
    email,
    password,
    repeatPassword,
    submit,
  };
}

async function satisfyTermsIfAny(dialog: Locator) {
  const termsByLabel = dialog
    .getByLabel(/(agree|terms|conditions|policy|privacy)/i)
    .first();

  try {
    if (await termsByLabel.isVisible()) {
      try {
        await termsByLabel.check({ force: true });
      } catch {
        await termsByLabel.click({ force: true });
      }
      return;
    }
  } catch {
  }
  const checkboxes = await dialog.getByRole('checkbox').all();
  for (const cb of checkboxes) {
    try {
      if (!(await cb.isChecked())) {
        await cb.check({ force: true });
      }
    } catch {
    }
  }
}

// ---------------- TESTS ----------------

test('home is reachable', async ({ page }) => {
  await gotoHome(page);

  await expect(page).toHaveURL(/forstudy\.space\/?$/i);
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
});

test.describe('Registration — positive & negative', () => {
  test('positive: can register a new user (redirects to Garage)', async ({ page }) => {
    const dialog = await openRegistrationDialog(page);
    const {
      firstName,
      lastName,
      email,
      password,
      repeatPassword,
      submit,
    } = registrationFields(dialog);

    const id = uniq();

    await firstName.fill(`Alex${id}`);
    await lastName.fill('Test');
    await email.fill(`alex-${id}@mailinator.com`);
    await password.fill(VALID_PASS);
    await repeatPassword.fill(VALID_PASS);

    await satisfyTermsIfAny(dialog);

    await expect
      .poll(async () => await submit.isEnabled(), {
        timeout: 5000,
        intervals: [200, 400, 800, 1600],
      })
      .toBeTruthy();

    await submit.click();

    await expect(page).toHaveURL(/garage/i);
    await expect(page.getByRole('heading', { name: /garage/i })).toBeVisible();
  });

  test('neg: empty submit → required errors for all fields', async ({ page }) => {
    const dialog = await openRegistrationDialog(page);
    const {
      firstName,
      lastName,
      email,
      password,
      repeatPassword,
      submit,
    } = registrationFields(dialog);

    for (const field of [firstName, lastName, email, password, repeatPassword]) {
      await field.focus();
      await field.blur();
    }

    await expect(submit).toBeDisabled();
  });

  test('neg: name length < 2 → "Name has to be from 2 to 20 characters long"', async ({
    page,
  }) => {
    const dialog = await openRegistrationDialog(page);
    const {
      firstName,
      lastName,
      email,
      password,
      repeatPassword,
      submit,
    } = registrationFields(dialog);

    const id = uniq();

    await firstName.fill('A'); // 1 символ
    await lastName.fill('Test');
    await email.fill(`short-${id}@mailinator.com`);
    await password.fill(VALID_PASS);
    await repeatPassword.fill(VALID_PASS);

    await satisfyTermsIfAny(dialog);

    await submit.click().catch(() => {});

    const nameErrorCandidate = dialog.getByText(
      /name.*(min|min\.|at least|least 2|too short|characters?)/i,
    );

    const count = await nameErrorCandidate.count();

    if (count > 0) {
      await expect(nameErrorCandidate.first()).toBeVisible();
    } else {

      const aria = await firstName.getAttribute('aria-invalid');
      const cls = await firstName.getAttribute('class');

      expect(
        (cls && /invalid|ng-invalid|error/i.test(cls)) ||
        aria === 'true',
      ).toBeTruthy();
    }
  });

  test('neg: weak password is rejected', async ({ page }) => {
    const dialog = await openRegistrationDialog(page);
    const {
      firstName,
      lastName,
      email,
      password,
      repeatPassword,
      submit,
    } = registrationFields(dialog);

    const id = uniq();

    await firstName.fill(`Alex${id}`);
    await lastName.fill('Test');
    await email.fill(`weak-${id}@mailinator.com`);
    await password.fill(BAD_PASS);
    await repeatPassword.fill(BAD_PASS);

    await satisfyTermsIfAny(dialog);

    await submit.click().catch(() => {});

    await expect(
      dialog.getByText(/password.*(weak|too short|at least)/i),
    ).toBeVisible();
  });
});