/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';
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

  globalSetup: './global-setup',
  outputDir: 'test-results'
});