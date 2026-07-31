import { expect, type Locator, type Page } from "@playwright/test";

export async function openSettings(page: Page): Promise<Locator> {
  await page.getByRole("button", { name: "Settings" }).click();
  const settings = page.getByRole("dialog", { name: "Settings" });
  await expect(settings).toBeVisible();
  return settings;
}

export async function closeSettings(
  page: Page,
  settings: Locator,
): Promise<void> {
  await settings.getByRole("button", { name: "Close Settings" }).click();
  await expect(settings).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Settings" })).toBeFocused();
}
