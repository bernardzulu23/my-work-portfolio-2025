import { test, expect } from '@playwright/test';

test.describe('Projects Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');
  });

  test('should display featured projects and project details', async ({ page }) => {
    const projectCards = page.locator('div.grid > div');
    const count = await projectCards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = projectCards.nth(i);
      await expect(card.locator('h3')).toBeVisible();
      await expect(card.locator('p')).toBeVisible();
      await expect(card.locator('button', { hasText: 'View Project' })).toBeVisible();
    }
  });

  test('should navigate to project details on View Project button click', async ({ page }) => {
    const firstProjectButton = page.locator('button', { hasText: 'View Project' }).first();
    await firstProjectButton.click();
    await expect(page).toHaveURL(/projects\?project=\d+/);
  });

  test('should have View All Projects button', async ({ page }) => {
    const button = page.locator('button', { hasText: 'View All Projects' });
    await expect(button).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
  });
});
