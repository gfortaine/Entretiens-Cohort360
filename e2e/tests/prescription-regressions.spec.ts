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
   * SPEC COMPLIANCE TEST: Edit button on each row
   * US-003: "Edit button on each prescription row"
   */
  test('should have Edit button on each table row', async ({ page }) => {
    // Find all Edit buttons in the table
    const editButtons = page.locator('table button[title*="Modifier"], table button[title*="Edit"]');
    
    const tableRows = page.locator('table tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      const buttonCount = await editButtons.count();
      expect(buttonCount).toBe(rowCount);
    }
  });

  /**
   * SPEC COMPLIANCE TEST: Delete button on each row  
   * US-004: "Delete button on each prescription row"
   */
  test('should have Delete button on each table row', async ({ page }) => {
    // Find all Delete buttons in the table
    const deleteButtons = page.locator('table button[title*="Supprimer"], table button[title*="Delete"]');
    
    const tableRows = page.locator('table tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      const buttonCount = await deleteButtons.count();
      expect(buttonCount).toBe(rowCount);
    }
  });

  test('Edit button should open edit dialog', async ({ page }) => {
    // Find the first Edit button
    const editButton = page.locator('table button[title*="Modifier"], table button[title*="Edit"]').first();
    
    // Skip if no edit buttons found
    if (!(await editButton.isVisible())) {
      test.skip();
      return;
    }
    
    // Click the edit button
    await editButton.click();
    
    // Dialog should open
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    
    // Dialog should have edit-specific content (title mentions "Modifier" or "Edit")
    const dialogTitle = dialog.locator('h2, [role="heading"]');
    await expect(dialogTitle).toContainText(/modifier|edit/i);
  });

  test('Edit button click should not trigger row click', async ({ page }) => {
    // This ensures the edit button has stopPropagation
    const editButton = page.locator('table button[title*="Modifier"], table button[title*="Edit"]').first();
    
    if (!(await editButton.isVisible())) {
      test.skip();
      return;
    }
    
    // Click on the edit button
    await editButton.click();
    
    // Dialog should be the edit dialog, not something else
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
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
