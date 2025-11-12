# === fix-playwright-config.ps1 ===
$src = "tests\playwright.config.ts"
$dst = "playwright.config.ts"

Write-Host "=== Playwright config fixer ==="

# 1) Ð¯ÐºÑ‰Ð¾ Ð² ÐºÐ¾Ñ€ÐµÐ½Ñ– Ð²Ð¶Ðµ Ñ” ÐºÐ¾Ð½Ñ„Ñ–Ð³ â€” Ð·Ñ€Ð¾Ð±Ð¸Ð¼Ð¾ Ð±ÐµÐºÐ°Ð¿
if (Test-Path $dst) {
  $backup = "playwright.config.backup.$((Get-Date).ToString('yyyyMMdd-HHmmss')).ts"
  Copy-Item $dst $backup -Force
  Write-Host "Backup created: $backup"
}

# 2) Ð¯ÐºÑ‰Ð¾ ÐºÐ¾Ð½Ñ„Ñ–Ð³ Ð»ÐµÐ¶Ð¸Ñ‚ÑŒ Ñƒ tests/, Ð¿ÐµÑ€ÐµÐ½ÐµÑÐµÐ¼Ð¾ Ð² ÐºÐ¾Ñ€Ñ–Ð½ÑŒ
if (Test-Path $src) {
  Move-Item $src $dst -Force
  Write-Host "Moved $src -> $dst"
}

# 3) Ð—Ð°Ð¿Ð¸ÑˆÐµÐ¼Ð¾ ÐºÐ°Ð½Ð¾Ð½Ñ–Ñ‡Ð½Ð¸Ð¹ ÐºÐ¾Ð½Ñ„Ñ–Ð³ Ñƒ ÐºÐ¾Ñ€ÐµÐ½Ñ– (Ð¿ÐµÑ€ÐµÐºÑ€Ð¸Ñ” Ñ–ÑÐ½ÑƒÑŽÑ‡Ð¸Ð¹ $dst Ð²Ð°Ð»Ñ–Ð´Ð½Ð¸Ð¼ Ð²Ð¼Ñ–ÑÑ‚Ð¾Ð¼)
@"
/// <reference types=""node"" />
import { defineConfig, devices } from '@playwright/test';
import globalSetup from './global-setup';
import 'dotenv/config';

const BASE_URL   = process.env.BASE_URL   ?? 'https://qauto.forstudy.space';
const BASIC_USER = process.env.BASIC_USER ?? 'guest';
const BASIC_PASS = process.env.BASIC_PASS ?? 'welcome2qauto';

export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }]
  ],

  use: {
    baseURL: BASE_URL,
    timezoneId: 'Europe/Warsaw',
    locale: 'uk-UA',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'retain-on-failure',
    storageState: 'auth/storageState.json',
    httpCredentials: { username: BASIC_USER, password: BASIC_PASS }
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } }
  ],

  globalSetup,
  outputDir: 'test-results'
});
"@ | Set-Content -Encoding UTF8 $dst

# 4) Ð¯ÐºÑ‰Ð¾ Ð½ÐµÐ¼Ð°Ñ” global-setup.ts â€” ÑÑ‚Ð²Ð¾Ñ€Ð¸Ð¼Ð¾ Ð²Ð°Ð»Ñ–Ð´Ð½Ð¸Ð¹
if (-not (Test-Path "global-setup.ts")) {
@"
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
"@ | Set-Content -Encoding UTF8 "global-setup.ts"
  Write-Host "Created global-setup.ts"
}

# 5) ÐŸÑ€Ð¸Ð±ÐµÑ€ÐµÐ¼Ð¾ Ð¼Ð¾Ð¶Ð»Ð¸Ð²Ð¸Ð¹ Ð´ÑƒÐ±Ð»ÑŒ Ñƒ tests/
if (Test-Path $src) { Remove-Item $src -Force }

Write-Host "Done. Config is at $dst"
# === end ===
