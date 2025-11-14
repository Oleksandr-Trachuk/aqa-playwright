import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },

  use: {
  
    baseURL: 'https://qauto.forstudy.space',

  
    httpCredentials: {
      username: 'guest',
      password: 'welcome2qauto',
    },

    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: false,
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