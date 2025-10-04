import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between pages using navigation menu', async ({ page }) => {
    await page.goto('/');

    // Check if navigation is visible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Navigate to About page
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL('/about');
    await expect(page.locator('h1.section-title')).toHaveText('About Me');

    // Navigate to Experience page
    await page.click('a[href="/experience"]');
    await expect(page).toHaveURL('/experience');
    await expect(page.locator('h1.section-title')).toHaveText('Experience');

    // Navigate back to Home
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Hi, I\'m');
  });

  test('should display dynamic name in navigation', async ({ page }) => {
    await page.goto('/');

    // Check if navigation contains dynamic name
    const navBrand = page.locator('nav a[href="/"]').first();
    await expect(navBrand).toBeVisible();
    const brandText = await navBrand.textContent();
    expect(brandText).toMatch(/\w+/); // Should contain a name
  });

  test('should handle mobile navigation menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Check if mobile menu button exists
    const mobileMenuButton = page.locator('button.mobile-menu-toggle');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();

      // Check if mobile menu is visible
      const mobileMenu = page.locator('.mobile-menu');
      await expect(mobileMenu).toBeVisible();

      // Close mobile menu
      await mobileMenuButton.click();
      await expect(mobileMenu).not.toBeVisible();
    }
  });
});
