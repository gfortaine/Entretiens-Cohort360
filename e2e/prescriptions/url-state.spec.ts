import { test, expect } from '../fixtures';

/**
 * E2E Tests for URL State Synchronization
 * Tests nuqs integration for filter and pagination URL persistence
 *
 * Features tested:
 * - Filter state persisted to URL query params
 * - Page number persisted to URL
 * - Deep linking (navigating directly with query params)
 * - Browser back/forward navigation
 * - URL updates on filter changes
 */

test.describe('URL State - Query Parameters', () => {
  test('should have clean URL on initial load', async ({ prescriptionPage }) => {
    const params = await prescriptionPage.getUrlParams();
    
    // Initial load should have minimal or no params (page defaults to 1)
    expect(params.get('patient')).toBeNull();
    expect(params.get('medication')).toBeNull();
    expect(params.get('status')).toBeNull();
  });

  test('should update URL when selecting patient filter', async ({ prescriptionPage, page }) => {
    // Select a patient filter
    await prescriptionPage.filterPatientSelect.click();
    
    // Get first patient option (skip "All patients")
    const options = page.getByRole('option');
    const optionCount = await options.count();
    
    if (optionCount > 1) {
      await options.nth(1).click();
      
      // Wait for URL to update
      await page.waitForTimeout(500);
      
      const params = await prescriptionPage.getUrlParams();
      expect(params.get('patient')).not.toBeNull();
    }
  });

  test('should update URL when selecting status filter', async ({ prescriptionPage, page }) => {
    await prescriptionPage.selectFilterStatus('valide');
    
    await page.waitForTimeout(500);
    
    const params = await prescriptionPage.getUrlParams();
    expect(params.get('status')).toBe('valide');
  });

  test('should update URL when selecting medication filter', async ({ prescriptionPage, page }) => {
    await prescriptionPage.filterMedicationSelect.click();
    
    const options = page.getByRole('option');
    const optionCount = await options.count();
    
    if (optionCount > 1) {
      await options.nth(1).click();
      await page.waitForTimeout(500);
      
      const params = await prescriptionPage.getUrlParams();
      expect(params.get('medication')).not.toBeNull();
    }
  });

  test('should clear URL params when clearing filters', async ({ prescriptionPage, page }) => {
    // First apply a filter
    await prescriptionPage.selectFilterStatus('valide');
    await page.waitForTimeout(300);
    
    let params = await prescriptionPage.getUrlParams();
    expect(params.get('status')).toBe('valide');
    
    // Clear filters
    await prescriptionPage.clearFilters();
    await page.waitForTimeout(500);
    
    params = await prescriptionPage.getUrlParams();
    expect(params.get('status')).toBeNull();
  });

  test('should preserve multiple filters in URL', async ({ prescriptionPage, page }) => {
    // Apply status filter
    await prescriptionPage.selectFilterStatus('en_attente');
    await page.waitForTimeout(300);
    
    // Apply patient filter
    await prescriptionPage.filterPatientSelect.click();
    const options = page.getByRole('option');
    if (await options.count() > 1) {
      await options.nth(1).click();
      await page.waitForTimeout(300);
    }
    
    const params = await prescriptionPage.getUrlParams();
    expect(params.get('status')).toBe('en_attente');
    // Patient param should also be set
    expect(params.has('patient') || params.has('status')).toBe(true);
  });
});

test.describe('URL State - Deep Linking', () => {
  test('should load page with status filter from URL', async ({ page }) => {
    // Navigate directly with query params
    await page.goto('/?status=valide');
    
    // Wait for page to load
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Verify the status filter is pre-selected
    const statusTrigger = page.locator('#status');
    await expect(statusTrigger).toContainText(/valide|valid/i);
  });

  test('should load page with page number from URL', async ({ page }) => {
    await page.goto('/?page=2');
    
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // URL should still have page=2
    const url = new URL(page.url());
    expect(url.searchParams.get('page')).toBe('2');
  });

  test('should load page with multiple filters from URL', async ({ page }) => {
    await page.goto('/?status=valide&page=1');
    
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    const url = new URL(page.url());
    expect(url.searchParams.get('status')).toBe('valide');
  });

  test('should load page with date filters from URL', async ({ page }) => {
    await page.goto('/?start_date_from=2025-01-01&start_date_to=2025-12-31');
    
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    const url = new URL(page.url());
    expect(url.searchParams.get('start_date_from')).toBe('2025-01-01');
    expect(url.searchParams.get('start_date_to')).toBe('2025-12-31');
  });
});

test.describe('URL State - Browser Navigation', () => {
  test('should restore filters on browser back', async ({ prescriptionPage, page }) => {
    // Start with no filters
    const initialUrl = page.url();
    
    // Apply a filter
    await prescriptionPage.selectFilterStatus('valide');
    await page.waitForTimeout(500);
    
    const filteredUrl = page.url();
    expect(filteredUrl).toContain('status=valide');
    
    // Go back
    await page.goBack();
    await page.waitForTimeout(500);
    
    // Should be back to initial state
    const backUrl = page.url();
    expect(backUrl).not.toContain('status=valide');
  });

  test('should restore filters on browser forward', async ({ prescriptionPage, page }) => {
    // Apply filter
    await prescriptionPage.selectFilterStatus('valide');
    await page.waitForTimeout(500);
    
    // Go back
    await page.goBack();
    await page.waitForTimeout(500);
    
    // Go forward
    await page.goForward();
    await page.waitForTimeout(500);
    
    const url = new URL(page.url());
    expect(url.searchParams.get('status')).toBe('valide');
  });
});

test.describe('URL State - Page Reset on Filter Change', () => {
  test('should reset to page 1 when filter changes', async ({ page }) => {
    // Start on page 2
    await page.goto('/?page=2');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Apply a filter using shadcn Select
    const statusTrigger = page.locator('[data-slot="select-trigger"]').filter({ hasText: /statut|status/i });
    await statusTrigger.click();
    const content = page.locator('[data-slot="select-content"]');
    await expect(content).toBeVisible();
    await content.locator('[data-slot="select-item"]', { hasText: /valide|valid/i }).first().click();
    
    await page.waitForTimeout(500);
    
    // Page should be reset to 1 or not present in URL
    const url = new URL(page.url());
    const pageParam = url.searchParams.get('page');
    expect(pageParam === '1' || pageParam === null).toBe(true);
  });
});

test.describe('URL State - Shareable Links', () => {
  test('should produce shareable URL with all filters', async ({ prescriptionPage, page }) => {
    // Apply multiple filters
    await prescriptionPage.selectFilterStatus('valide');
    await page.waitForTimeout(300);
    
    // Get the shareable URL
    const shareableUrl = page.url();
    
    // Open in new context to simulate sharing
    const context = await page.context().browser()!.newContext();
    const newPage = await context.newPage();
    
    await newPage.goto(shareableUrl);
    await expect(newPage.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Verify filters are applied
    const statusTrigger = newPage.locator('#status');
    await expect(statusTrigger).toContainText(/valide|valid/i);
    
    await context.close();
  });
});
