import { test, expect } from '@playwright/test';

test.describe('Experience Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/experience');
  });

  test('should display experience timeline with entries', async ({ page }) => {
    const experienceSection = page.locator('div:has(h2:text("Experience"))');
    await expect(experienceSection).toBeVisible();
    const entries = experienceSection.locator('div.space-y-8 > div');
    const count = await entries.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const entry = entries.nth(i);
      await expect(entry.locator('h3')).toBeVisible();
      await expect(entry.locator('p')).toBeVisible();
    }
  });

  test('should display education section if present', async ({ page }) => {
    const educationSection = page.locator('div:has(h2:text("Education"))');
    if (await educationSection.isVisible()) {
      const entries = educationSection.locator('div.space-y-8 > div');
      const count = await entries.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
  });
});
