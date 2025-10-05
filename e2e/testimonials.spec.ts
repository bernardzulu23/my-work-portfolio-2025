import { test, expect } from '@playwright/test';

test.describe('Testimonials Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/testimonials');
  });

  test('should display testimonials list', async ({ page }) => {
    const testimonialCards = page.locator('div.testimonial-card, div.grid > div');
    const count = await testimonialCards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = testimonialCards.nth(i);
      await expect(card.locator('p')).toBeVisible();
      await expect(card.locator('h3')).toBeVisible();
      await expect(card.locator('span')).toBeVisible(); // e.g. role or company
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    const testimonialCards = page.locator('div.testimonial-card, div.grid > div');
    await expect(testimonialCards.first()).toBeVisible();
  });
});
