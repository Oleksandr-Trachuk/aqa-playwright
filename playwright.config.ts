import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load .env variables
dotenv.config();

const BASE_URL = process.env.BASE_URL || 'https://qauto.forstudy.space';
const HTTP_USERNAME = process.env.HTTP_USERNAME;
const HTTP_PASSWORD = process.env.HTTP_PASSWORD;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  reporter: [['html', { outputFolder: 'playwright-report' }]],

  use: {
    baseURL: BASE_URL,

    httpCredentials: HTTP_USERNAME && HTTP_PASSWORD
      ? {
          username: HTTP_USERNAME,
          password: HTTP_PASSWORD,
        }
      : undefined,

    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
});