import { test, expect } from '@playwright/test';

/**
 * Prescription Table Regression Tests
 * 
 * These tests ensure that critical functionality in the prescription table
 * is not broken by future changes.
 */

test.describe('Prescription Table - Regression Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the table to be visible
    await page.waitForSelector('table', { state: 'visible' });
  });

  /**
   * REGRESSION TEST: Total count should always be visible
   * Issue: After migrating to TanStack Table, the total count was only showing
   * when there were multiple pages. It should always show the count.
   */
  test('should display total count in pagination footer', async ({ page }) => {
    // Look for the pagination footer with total count
    const paginationFooter = page.locator('.text-muted-foreground').filter({
      hasText: /Affichage de.*sur.*résultats|Showing.*of.*results/
    });
    
    await expect(paginationFooter).toBeVisible();
    
    // The count should contain numbers
    const text = await paginationFooter.textContent();
    expect(text).toMatch(/\d+/);
  });

  test('should show total count when filtering by status', async ({ page }) => {
    // Open filters if collapsed
    const filterButton = page.getByRole('button', { name: /filtres|filters/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();
    }
    
    // Select a status filter
    const statusSelect = page.getByLabel(/statut|status/i);
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('valide');
      
      // Wait for results to update
      await page.waitForTimeout(500);
    }
    
    // Total count should still be visible
    const paginationFooter = page.locator('.text-muted-foreground').filter({
      hasText: /Affichage de.*sur.*résultats|Showing.*of.*results/
    });
    
    await expect(paginationFooter).toBeVisible();
  });

  /**
   * REGRESSION TEST: Status should be editable
   * Issue: After migrating to TanStack Table, the status column was changed
   * from a select (combobox) to a static badge, removing the ability to
   * change the status inline.
   */
  test('should have editable status select in table rows', async ({ page }) => {
    // Find all status selects in the table
    const statusSelects = page.locator('table select[aria-label*="Statut"], table select[aria-label*="Status"]');
    
    // There should be at least one status select (if there are prescriptions)
    const count = await statusSelects.count();
    
    // If there are prescriptions, there should be status selects
    const tableRows = page.locator('table tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should allow changing prescription status', async ({ page }) => {
    // Find the first status select
    const statusSelect = page.locator('table select[aria-label*="Statut"], table select[aria-label*="Status"]').first();
    
    // Skip if no status selects found
    if (!(await statusSelect.isVisible())) {
      test.skip();
      return;
    }
    
    // Get the current value
    const currentValue = await statusSelect.inputValue();
    
    // Select a different status
    const newValue = currentValue === 'valide' ? 'en_attente' : 'valide';
    await statusSelect.selectOption(newValue);
    
    // Wait for the update to complete
    await page.waitForTimeout(500);
    
    // The value should have changed
    const updatedValue = await statusSelect.inputValue();
    expect(updatedValue).toBe(newValue);
  });

  test('status select should not trigger row click', async ({ page }) => {
    // If clicking the status select triggers the row click handler,
    // it would be a UX bug. This test ensures they are independent.
    
    const statusSelect = page.locator('table select[aria-label*="Statut"], table select[aria-label*="Status"]').first();
    
    if (!(await statusSelect.isVisible())) {
      test.skip();
      return;
    }
    
    // Click on the status select
    await statusSelect.click();
    
    // No modal or dialog should open (row click typically opens details)
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).not.toBeVisible();
  });
});

test.describe('Prescription Table - Total Count Edge Cases', () => {
  
  test('should show "0 sur 0" when no results', async ({ page }) => {
    await page.goto('/');
    
    // Apply a filter that would return no results
    const filterButton = page.getByRole('button', { name: /filtres|filters/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();
    }
    
    // Try to find a patient search and enter something that won't match
    const patientInput = page.getByPlaceholder(/patient|rechercher/i);
    if (await patientInput.isVisible()) {
      await patientInput.fill('ZZZZNONEXISTENT12345');
      await patientInput.press('Enter');
      await page.waitForTimeout(500);
    }
    
    // Even with 0 results, we should see a count indicator
    const paginationFooter = page.locator('.text-muted-foreground').filter({
      hasText: /Affichage de|Showing|sur|of|résultats|results/
    });
    
    // If no results, the footer might show 0 or no results message
    const noResults = page.getByText(/aucun|no results/i);
    
    // Either pagination footer OR no results message should be visible
    const hasFooter = await paginationFooter.isVisible();
    const hasNoResults = await noResults.isVisible();
    
    expect(hasFooter || hasNoResults).toBe(true);
  });
});
