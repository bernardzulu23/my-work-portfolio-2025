import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display hero section with name, title, and bio', async ({ page }) => {
    await expect(page.locator('h1')).toContainText("Hi, I'm");
    await expect(page.locator('p').first()).toBeVisible(); // title
    await expect(page.locator('p').nth(1)).toBeVisible(); // bio
  });

  test('should have functional View My Work button', async ({ page }) => {
    const button = page.locator('button', { hasText: 'View My Work' });
    await expect(button).toBeVisible();
    await button.click();
    await expect(page).toHaveURL('/projects');
  });

  test('should have Download Resume button', async ({ page }) => {
    const button = page.locator('button', { hasText: 'Download Resume' });
    await expect(button).toBeVisible();
    // Note: Actual download testing would require additional setup
  });

  test('should display quick stats section', async ({ page }) => {
    const statsSection = page.locator('section').nth(1); // Quick Stats Section
    await expect(statsSection.locator('text=Projects Completed')).toBeVisible();
    await expect(statsSection.locator('text=Years Experience')).toBeVisible();
    await expect(statsSection.locator('text=Certifications')).toBeVisible();
    await expect(statsSection.locator('text=Technologies')).toBeVisible();
  });

  test('should display featured projects section', async ({ page }) => {
    const projectsSection = page.locator('section').nth(2); // Featured Projects Section
    await expect(projectsSection.locator('h2')).toHaveText('Featured Projects');
    const projectCards = projectsSection.locator('div.grid > div');
    const count = await projectCards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = projectCards.nth(i);
      await expect(card.locator('h3')).toBeVisible();
      await expect(card.locator('p')).toBeVisible();
    }
  });

  test('should have View All Projects button that navigates', async ({ page }) => {
    const button = page.locator('button', { hasText: 'View All Projects' });
    await expect(button).toBeVisible();
    await button.click();
    await expect(page).toHaveURL('/projects');
  });

  test('should display technologies section', async ({ page }) => {
    const skillsSection = page.locator('section').nth(3); // Skills Preview Section
    await expect(skillsSection.locator('h2')).toHaveText('Technologies I Work With');
    const skillCards = skillsSection.locator('div.grid > div');
    const count = await skillCards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 4); i++) {
      const card = skillCards.nth(i);
      await expect(card.locator('h3')).toBeVisible();
    }
  });

  test('should have View All Skills button that navigates', async ({ page }) => {
    const button = page.locator('button', { hasText: 'View All Skills' });
    await expect(button).toBeVisible();
    await button.click();
    await expect(page).toHaveURL('/skills');
  });

  test('should display call to action section', async ({ page }) => {
    const ctaSection = page.locator('section').nth(4); // Call to Action Section
    await expect(ctaSection.locator('h2')).toHaveText("Let's Work Together");
    await expect(ctaSection.locator('button', { hasText: 'Get In Touch' })).toBeVisible();
    await expect(ctaSection.locator('button', { hasText: 'View Resume' })).toBeVisible();
  });

  test('should have Get In Touch button that navigates', async ({ page }) => {
    const button = page.locator('button', { hasText: 'Get In Touch' });
    await expect(button).toBeVisible();
    await button.click();
    await expect(page).toHaveURL('/contact');
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button', { hasText: 'View My Work' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Download Resume' })).toBeVisible();
  });
});
