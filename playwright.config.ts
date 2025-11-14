import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },

  use: {
    // Базовий URL
    baseURL: 'https://qauto.forstudy.space',

    // 🔐 BASIC AUTH для сайту
    httpCredentials: {
      username: 'guest',
      password: 'welcome2qauto',
    },

    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: false, // можеш ставити true, якщо хочеш без UI
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  reporter: [['list']],
});