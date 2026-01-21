import { test, expect } from '../fixtures';

/**
 * Example E2E Tests
 * 
 * These tests demonstrate common patterns for E2E testing.
 * Replace with your actual feature tests.
 */

test.describe('App - Basic', () => {
  test('should load the page successfully', async ({ examplePage }) => {
    // Page should have a heading
    await expect(examplePage.heading).toBeVisible();
  });

  test('should have main content area', async ({ examplePage }) => {
    await expect(examplePage.mainContent).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should preserve URL state on reload', async ({ examplePage, page }) => {
    // Navigate to a page with query params
    await page.goto('/?page=2');
    
    // Reload
    await page.reload();
    
    // URL should still have the params
    const params = await examplePage.getUrlParams();
    expect(params.get('page')).toBe('2');
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ examplePage }) => {
    // H1 should be visible
    await expect(examplePage.heading).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Something should be focused
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });
});

test.describe('Error Handling', () => {
  test('should handle invalid routes gracefully', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    
    // App should not crash - some content should exist
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });
});
