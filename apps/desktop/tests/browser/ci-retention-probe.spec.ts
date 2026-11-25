import {expect,test} from "@playwright/test";

test("temporary synthetic Chromium evidence probe", async ({ page }) => {
  await page.setContent("<p>Synthetic CI retention fixture</p>");
  await expect(page.locator("p")).toHaveText("Deliberate mismatch");
});
