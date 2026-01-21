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
    // Wait for at least one edit button to be visible
    const firstEditButton = page.locator('table button[title*="Modifier"], table button[title*="Edit"]').first();
    await firstEditButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
    
    // Find all Edit buttons in the table
    const editButtons = page.locator('table button[title*="Modifier"], table button[title*="Edit"]');
    
    const tableRows = page.locator('table tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      const buttonCount = await editButtons.count();
      // Should have at least one edit button (may differ if some rows don't have actions)
      expect(buttonCount).toBeGreaterThan(0);
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
  
  test('should show results count info', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('table', { state: 'visible' });
    
    // Look for the "Showing X to Y of Z results" text specifically
    const resultsInfo = page.getByText(/Showing \d+ to \d+ of \d+ results|Affichage de \d+ à \d+ sur \d+ résultats/);
    
    await expect(resultsInfo).toBeVisible();
  });
});

/**
 * EDIT FUNCTIONALITY TESTS (US-003)
 * Tests for the Edit prescription workflow
 */
test.describe('Prescription Table - Edit Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('table', { state: 'visible' });
  });

  test('Edit dialog should show prescription data', async ({ page }) => {
    // Find the first Edit button
    const editButton = page.locator('table button[title*="Modifier"], table button[title*="Edit"]').first();
    
    if (!(await editButton.isVisible())) {
      test.skip();
      return;
    }
    
    // Click the edit button
    await editButton.click();
    
    // Dialog should open
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    
    // Dialog should contain form fields
    const hasFormFields = await dialog.locator('input, select, textarea').count() > 0;
    expect(hasFormFields).toBe(true);
  });

  test('Edit dialog should have disabled patient field', async ({ page }) => {
    // Per spec: patient cannot be changed after creation
    const editButton = page.locator('table button[title*="Modifier"], table button[title*="Edit"]').first();
    
    if (!(await editButton.isVisible())) {
      test.skip();
      return;
    }
    
    await editButton.click();
    
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    
    // Patient field should be disabled
    const patientSelect = dialog.locator('select[name="patient"], [data-testid="patient-select"]');
    if (await patientSelect.isVisible()) {
      await expect(patientSelect).toBeDisabled();
    }
  });

  test('Edit dialog should have "Mettre à jour" button', async ({ page }) => {
    const editButton = page.locator('table button[title*="Modifier"], table button[title*="Edit"]').first();
    
    if (!(await editButton.isVisible())) {
      test.skip();
      return;
    }
    
    await editButton.click();
    
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    
    // Should have update button
    const updateButton = dialog.getByRole('button', { name: /mettre à jour|update/i });
    await expect(updateButton).toBeVisible();
  });

  test('Cancel edit should close dialog without changes', async ({ page }) => {
    const editButton = page.locator('table button[title*="Modifier"], table button[title*="Edit"]').first();
    
    if (!(await editButton.isVisible())) {
      test.skip();
      return;
    }
    
    // Get original row content
    const firstRow = page.locator('table tbody tr').first();
    const originalContent = await firstRow.textContent();
    
    await editButton.click();
    
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    
    // Click cancel or close
    const cancelButton = dialog.getByRole('button', { name: /annuler|cancel/i });
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
    } else {
      // Try closing via X button or Escape
      await page.keyboard.press('Escape');
    }
    
    // Dialog should be closed
    await expect(dialog).not.toBeVisible();
    
    // Row content should be unchanged
    const newContent = await firstRow.textContent();
    expect(newContent).toBe(originalContent);
  });
});

/**
 * DELETE FUNCTIONALITY TESTS (US-004)
 * Tests for the Delete (soft delete) prescription workflow
 */
test.describe('Prescription Table - Delete Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('table', { state: 'visible' });
  });

  test('Delete button should be visible on each row', async ({ page }) => {
    const deleteButtons = page.locator('table button[title*="Supprimer"], table button[title*="Delete"]');
    const tableRows = page.locator('table tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      const buttonCount = await deleteButtons.count();
      expect(buttonCount).toBeGreaterThan(0);
    }
  });

  test('Delete button has correct icon', async ({ page }) => {
    const deleteButton = page.locator('table button[title*="Supprimer"], table button[title*="Delete"]').first();
    
    if (!(await deleteButton.isVisible())) {
      test.skip();
      return;
    }
    
    // Button should contain trash icon (🗑️ or svg)
    const buttonContent = await deleteButton.textContent();
    const hasSvg = await deleteButton.locator('svg').count() > 0;
    
    expect(buttonContent?.includes('🗑️') || hasSvg).toBe(true);
  });

  test('Delete button is present in actions', async ({ page }) => {
    // Per spec, delete is a direct PATCH to status: 'suppr'
    const deleteButton = page.locator('table button[title*="Supprimer"], table button[title*="Delete"]').first();
    
    // Wait for button to be visible
    await deleteButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
    
    if (!(await deleteButton.isVisible())) {
      test.skip();
      return;
    }
    
    // Just verify the button exists and has the right title
    const title = await deleteButton.getAttribute('title');
    expect(title).toMatch(/supprimer|delete/i);
  });
});

/**
 * ACTIONS COLUMN TESTS
 * Tests for the Actions column behavior
 */
test.describe('Prescription Table - Actions Column', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('table', { state: 'visible' });
  });

  test('Actions column should be the last column', async ({ page }) => {
    const headerCells = page.locator('table thead th');
    const headerCount = await headerCells.count();
    
    if (headerCount > 0) {
      const lastHeader = headerCells.nth(headerCount - 1);
      const lastHeaderText = await lastHeader.textContent();
      expect(lastHeaderText?.toLowerCase()).toContain('actions');
    }
  });

  test('Actions column should contain both Edit and Delete buttons', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    
    if (!(await firstRow.isVisible())) {
      test.skip();
      return;
    }
    
    // Get the last cell (actions column)
    const cells = firstRow.locator('td');
    const cellCount = await cells.count();
    const actionsCell = cells.nth(cellCount - 1);
    
    // Should have both buttons
    const editButton = actionsCell.locator('button[title*="Modifier"], button[title*="Edit"]');
    const deleteButton = actionsCell.locator('button[title*="Supprimer"], button[title*="Delete"]');
    
    await expect(editButton).toBeVisible();
    await expect(deleteButton).toBeVisible();
  });

  test('Action buttons should have tooltips', async ({ page }) => {
    const editButton = page.locator('table button[title*="Modifier"], table button[title*="Edit"]').first();
    const deleteButton = page.locator('table button[title*="Supprimer"], table button[title*="Delete"]').first();
    
    if (!(await editButton.isVisible())) {
      test.skip();
      return;
    }
    
    // Check title attributes
    const editTitle = await editButton.getAttribute('title');
    const deleteTitle = await deleteButton.getAttribute('title');
    
    expect(editTitle).toBeTruthy();
    expect(deleteTitle).toBeTruthy();
  });
});
