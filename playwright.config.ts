import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: process.env.BASE_URL, // https://qauto.forstudy.space/panel
    httpCredentials: {
      username: process.env.HTTP_USERNAME || '',
      password: process.env.HTTP_PASSWORD || '',
    },
    trace: 'on-first-retry',
  },

  projects: [
    // ---- SETUP ----
    {
      name: 'setup',
      testMatch: /.*auth\.setup\.spec\.ts/, // тільки setup-тест
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'chromium',
      testMatch: /^(?!.*auth\.setup\.spec\.ts$).*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup'],
    },
  ],
});