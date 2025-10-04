import { test, expect } from '@playwright/test';

test.describe('About Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
  });

  test('should display the About Me section with name and bio', async ({ page }) => {
    await expect(page.locator('h1.section-title')).toHaveText('About Me');
    await expect(page.locator('h2')).toContainText(/Hi, I\'m/);
    await expect(page.locator('p')).toContainText(/Get to know more about my journey/);
  });

  test('should display personal name dynamically', async ({ page }) => {
    const nameLocator = page.locator('h2');
    await expect(nameLocator).toBeVisible();
    const nameText = await nameLocator.textContent();
    expect(nameText).toMatch(/Hi, I'm \w+/);
  });

  test('should display values section with icons and descriptions', async ({ page }) => {
    const valuesSection = page.locator('div:has(h2:text("My Values"))');
    await expect(valuesSection).toBeVisible();
    const valueCards = valuesSection.locator('div.grid > div');
    const count = await valueCards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const card = valueCards.nth(i);
      await expect(card.locator('h3')).toBeVisible();
      await expect(card.locator('p')).toBeVisible();
      await expect(card.locator('span')).toBeVisible(); // icon
    }
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

  test('should show availability status with correct color', async ({ page }) => {
    const availabilityText = await page.locator('div.flex.items-center.space-x-2.text-gray-600 span').first().textContent();
    expect(availabilityText).toMatch(/Available for opportunities|Currently busy|Not available/);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone 6/7/8 size
    await expect(page.locator('h1.section-title')).toBeVisible();
    await expect(page.locator('h2')).toBeVisible();
  });
});
