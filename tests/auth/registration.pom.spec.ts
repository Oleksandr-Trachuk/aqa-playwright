import { test, expect } from "@playwright/test";

test("placeholder POM test", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/forstudy/);
});