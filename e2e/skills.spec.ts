import { test, expect } from '@playwright/test';

test.describe('Skills Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/skills');
  });

  test('should display list of skills with proficiency bars', async ({ page }) => {
    const skillCards = page.locator('div.grid > div');
    const count = await skillCards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 5); i++) {
      const card = skillCards.nth(i);
      await expect(card.locator('h3')).toBeVisible();
      await expect(card.locator('div.w-full.bg-gray-200')).toBeVisible(); // progress bar
      await expect(card.locator('span')).toContainText('% proficiency');
    }
  });

  test('should display skill categories if present', async ({ page }) => {
    // Check for any category headers or filters
    const categories = page.locator('h2, .category-title');
    if (await categories.count() > 0) {
      await expect(categories.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    const skillCards = page.locator('div.grid > div');
    await expect(skillCards.first()).toBeVisible();
  });
});
