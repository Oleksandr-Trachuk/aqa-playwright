import { chromium, type FullConfig } from '@playwright/test';
import 'dotenv/config';


export default async function globalSetup(_config: FullConfig): Promise<void> {
  const BASE_URL       = process.env.BASE_URL       ?? 'https://qauto.forstudy.space';
  const BASIC_USER     = process.env.BASIC_USER     ?? 'guest';
  const BASIC_PASS     = process.env.BASIC_PASS     ?? 'welcome2qauto';
  const QAUTO_EMAIL    = process.env.QAUTO_EMAIL    ?? 'lanifel629@foxroids.com';
  const QAUTO_PASSWORD = process.env.QAUTO_PASSWORD ?? '1q2w3e4r5T';

  const browser = await chromium.launch();
  const context = await browser.newContext({
    baseURL: BASE_URL,
    timezoneId: 'Europe/Warsaw',
    locale: 'uk-UA',
    httpCredentials: { username: BASIC_USER, password: BASIC_PASS }
  });
  const page = await context.newPage();

  await page.goto('/');

  const resp = await page.request.post('/api/auth/signin', {
    data: { email: QAUTO_EMAIL, password: QAUTO_PASSWORD, remember: false }
  });
  if (!resp.ok()) {
    const txt = await resp.text();
    throw new Error(`Signin failed: ${resp.status()} ${txt}`);
  }

  const check = await page.request.get('/api/cars');
  if (!check.ok()) {
    const txt = await check.text();
    throw new Error(`Auth check failed: ${check.status()} ${txt}`);
  }

  await page.goto('/panel/garage');
  await context.storageState({ path: 'auth/storageState.json' });
  await browser.close();
}