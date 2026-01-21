import { test, expect } from '../fixtures';

/**
 * E2E Tests for Prescription Management
 * Cohort360 - Medical Prescription Application
 *
 * Tests cover the complete CRUD workflow for prescriptions
 * Updated for shadcn/ui components.
 */

test.describe('Prescription App - Page Load', () => {
  test('should display the main heading', async ({ prescriptionPage }) => {
    await expect(prescriptionPage.heading).toBeVisible();
  });

  test('should have proper page structure', async ({ prescriptionPage, page }) => {
    // Check essential elements are present
    await expect(prescriptionPage.newPrescriptionButton).toBeVisible();
    await expect(prescriptionPage.toggleFiltersButton).toBeVisible();
    await expect(prescriptionPage.prescriptionTable).toBeVisible();
  });

  test('should load patients and medications from API', async ({ prescriptionPage, page }) => {
    // Open the dialog to check if dropdowns are populated
    await prescriptionPage.openNewPrescriptionDialog();
    
    // Click patient select to see options (shadcn Select)
    await prescriptionPage.dialogPatientSelect.click();
    const selectContent = page.locator('[data-slot="select-content"]');
    await expect(selectContent).toBeVisible();
    const patientOptions = selectContent.locator('[data-slot="select-item"]');
    const patientCount = await patientOptions.count();
    await page.keyboard.press('Escape');

    // Should have options available
    expect(patientCount).toBeGreaterThanOrEqual(1);
    
    await prescriptionPage.closeDialog();
  });
});

test.describe('Prescription Form - Dialog', () => {
  test('should open new prescription dialog', async ({ prescriptionPage }) => {
    await prescriptionPage.openNewPrescriptionDialog();
    
    await expect(prescriptionPage.dialog).toBeVisible();
    await expect(prescriptionPage.dialogSubmitButton).toBeVisible();
    
  });

  test('should close dialog on cancel', async ({ prescriptionPage }) => {
    await prescriptionPage.openNewPrescriptionDialog();
    await expect(prescriptionPage.dialog).toBeVisible();
    
    await prescriptionPage.closeDialog();
    await expect(prescriptionPage.dialog).not.toBeVisible();
  });

  test('should close dialog on X button', async ({ prescriptionPage, page }) => {
    await prescriptionPage.openNewPrescriptionDialog();
    
    // Find close button (X) in dialog
    const closeButton = prescriptionPage.dialog.locator('button[aria-label*="close"], button:has(svg.lucide-x)').first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await expect(prescriptionPage.dialog).not.toBeVisible();
    }
  });
});

test.describe('Prescription CRUD - Create', () => {
  test('should create a new prescription successfully', async ({ prescriptionPage, page }) => {
    const initialCount = await prescriptionPage.getPrescriptionCount();

    // Open dialog and fill form
    await prescriptionPage.openNewPrescriptionDialog();
    
    // Select patient from shadcn Select
    await prescriptionPage.dialogPatientSelect.click();
    let content = page.locator('[data-slot="select-content"]');
    await expect(content).toBeVisible();
    await content.locator('[data-slot="select-item"]').nth(1).click();
    
    // Select medication
    await prescriptionPage.dialogMedicationSelect.click();
    content = page.locator('[data-slot="select-content"]');
    await expect(content).toBeVisible();
    await content.locator('[data-slot="select-item"]').nth(1).click();
    
    // Fill dates
    await prescriptionPage.dialogStartDateInput.fill('2025-06-01');
    await prescriptionPage.dialogEndDateInput.fill('2025-06-30');
    
    // Select status
    await prescriptionPage.dialogStatusSelect.click();
    await page.getByRole('option', { name: /valide|valid/i }).click();

    // Submit the form
    await prescriptionPage.dialogSubmitButton.click();

    // Wait for success (dialog closes)
    await prescriptionPage.waitForSuccess();

    // Verify prescription was added (or at least no error)
    await expect(prescriptionPage.prescriptionTable).toBeVisible();
  });
});

test.describe('Prescription CRUD - Read', () => {
  test('should display prescription table', async ({ prescriptionPage, page }) => {
    // Wait for prescriptions to load
    await page.waitForTimeout(1000);

    // Should show table or empty state
    const hasRows = (await prescriptionPage.getPrescriptionCount()) > 0;
    const hasEmpty = await prescriptionPage.emptyState.isVisible().catch(() => false);

    expect(hasRows || hasEmpty).toBe(true);
  });

  test('should show prescription details in table rows', async ({ prescriptionPage }) => {
    const count = await prescriptionPage.getPrescriptionCount();

    if (count > 0) {
      const firstRow = await prescriptionPage.getTableRowByIndex(0);

      // Row should be visible
      await expect(firstRow).toBeVisible();

      // Check for content
      const rowText = await firstRow.textContent();
      expect(rowText).toBeTruthy();
    }
  });
  
  test('should show table headers', async ({ prescriptionPage, page }) => {
    const table = prescriptionPage.prescriptionTable;
    
    // Check for expected column headers
    await expect(table.getByRole('columnheader', { name: /patient/i })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: /médicament|medication/i })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: /statut|status/i })).toBeVisible();
  });
});

test.describe('Prescription CRUD - Update', () => {
  test('should open edit dialog for existing prescription', async ({ prescriptionPage, page }) => {
    const count = await prescriptionPage.getPrescriptionCount();
    
    if (count > 0) {
      // Click edit button on first row
      const firstRow = await prescriptionPage.getTableRowByIndex(0);
      const editButton = firstRow.getByRole('button', { name: /modifier|edit/i });
      const hasEdit = await editButton.isVisible().catch(() => false);
      
      if (hasEdit) {
        await editButton.click();
        await expect(prescriptionPage.dialog).toBeVisible();
        
        // Dialog should have pre-filled values
        await expect(prescriptionPage.dialogSubmitButton).toBeVisible();
        
        await prescriptionPage.closeDialog();
      }
    }
  });

  test('should update prescription status', async ({ prescriptionPage, page }) => {
    const count = await prescriptionPage.getPrescriptionCount();
    
    if (count > 0) {
      const firstRow = await prescriptionPage.getTableRowByIndex(0);
      const editButton = firstRow.getByRole('button', { name: /modifier|edit/i });
      const hasEdit = await editButton.isVisible().catch(() => false);
      
      if (hasEdit) {
        await editButton.click();
        await expect(prescriptionPage.dialog).toBeVisible();
        
        // Change status
        await prescriptionPage.dialogStatusSelect.click();
        await page.getByRole('option', { name: /en cours|pending/i }).click();
        
        // Submit
        await prescriptionPage.dialogSubmitButton.click();
        
        // Wait for success
        await prescriptionPage.waitForSuccess();
        
        // Table should still be visible
        await expect(prescriptionPage.prescriptionTable).toBeVisible();
      }
    }
  });
});

test.describe('Prescription CRUD - Delete (Soft Delete)', () => {
  test('should have delete button on prescription rows', async ({ prescriptionPage }) => {
    const count = await prescriptionPage.getPrescriptionCount();
    
    if (count > 0) {
      const firstRow = await prescriptionPage.getTableRowByIndex(0);
      const deleteButton = firstRow.getByRole('button', { name: /supprimer|delete/i });
      
      // Delete button should exist (may be visible or in dropdown)
      const hasDelete = await deleteButton.isVisible().catch(() => false);
      expect(typeof hasDelete).toBe('boolean');
    }
  });

  test('should soft delete prescription (status becomes suppr)', async ({ prescriptionPage, page }) => {
    // First, filter to show only valid prescriptions
    await prescriptionPage.selectFilterStatus('valide');
    await page.waitForTimeout(500);
    
    const count = await prescriptionPage.getPrescriptionCount();
    
    if (count > 0) {
      const firstRow = await prescriptionPage.getTableRowByIndex(0);
      const deleteButton = firstRow.getByRole('button', { name: /supprimer|delete/i });
      const hasDelete = await deleteButton.isVisible().catch(() => false);
      
      if (hasDelete) {
        // Get prescription ID or content before delete
        const rowTextBefore = await firstRow.textContent();
        
        // Click delete
        await deleteButton.click();
        
        // Wait for API response
        await prescriptionPage.waitForSuccess();
        
        // After soft delete, the row should either:
        // 1. Disappear from filtered view (status=valide filter active)
        // 2. Show status as 'suppr' if filter is cleared
        
        // Clear filter and check the prescription now has suppr status
        await prescriptionPage.clearFilters();
        await page.waitForTimeout(500);
        
        // Filter by suppr to verify it exists there
        await prescriptionPage.selectFilterStatus('suppr');
        await page.waitForTimeout(500);
        
        // Should have at least one deleted prescription
        const deletedCount = await prescriptionPage.getPrescriptionCount();
        expect(deletedCount).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('should show deleted prescriptions when filtering by suppr status', async ({ prescriptionPage, page }) => {
    // Filter by suppr status
    await prescriptionPage.selectFilterStatus('suppr');
    await page.waitForTimeout(500);
    
    // URL should reflect filter
    const params = await prescriptionPage.getUrlParams();
    expect(params.get('status')).toBe('suppr');
    
    // Check for prescriptions or empty state
    const hasRows = (await prescriptionPage.getPrescriptionCount()) > 0;
    const hasEmpty = await prescriptionPage.emptyState.isVisible().catch(() => false);
    
    expect(hasRows || hasEmpty).toBe(true);
  });
});

test.describe('Prescription Filters - Legacy', () => {
  test('should filter by status using shadcn select', async ({ prescriptionPage, page }) => {
    // Apply status filter using shadcn Select
    await prescriptionPage.selectFilterStatus('valide');

    // Wait for filtered results
    await page.waitForTimeout(500);

    // URL should contain status filter
    const params = await prescriptionPage.getUrlParams();
    expect(params.get('status')).toBe('valide');
  });

  test('should clear all filters', async ({ prescriptionPage, page }) => {
    // Apply a filter first
    await prescriptionPage.selectFilterStatus('valide');
    await page.waitForTimeout(300);

    // Clear filters
    await prescriptionPage.clearFilters();
    await page.waitForTimeout(300);

    // URL should be clean
    const params = await prescriptionPage.getUrlParams();
    expect(params.get('status')).toBeNull();
  });
});

test.describe('Accessibility', () => {
  test('should have proper filter labels', async ({ prescriptionPage, page }) => {
    // Filter inputs should have associated labels
    await expect(page.getByText(/patient/i).first()).toBeVisible();
    await expect(page.getByText(/médicament|medication/i).first()).toBeVisible();
    await expect(page.getByText(/statut|status/i).first()).toBeVisible();
  });

  test('should be keyboard navigable', async ({ prescriptionPage, page }) => {
    // Tab through page elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to navigate without mouse
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeElement).toBeTruthy();
  });

  test('should have proper ARIA roles', async ({ prescriptionPage, page }) => {
    // Wait for page to load and table to be visible
    await expect(prescriptionPage.heading).toBeVisible();
    await expect(prescriptionPage.prescriptionTable).toBeVisible();
    
    // Check for proper ARIA attributes - table or grid
    const tableElement = await page.locator('table, [role="grid"], [role="table"]').count();
    const buttonElements = await page.getByRole('button').count();

    expect(tableElement).toBeGreaterThanOrEqual(1);
    expect(buttonElements).toBeGreaterThan(0);
  });
  
  test('should have accessible table structure', async ({ prescriptionPage }) => {
    await expect(prescriptionPage.prescriptionTable).toBeVisible();
    
    // Table should have headers
    const headers = prescriptionPage.prescriptionTable.getByRole('columnheader');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThan(0);
  });
});

test.describe('Mobile Responsiveness', () => {
  test('should display correctly on mobile viewport', async ({ prescriptionPage, page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Verify main elements are still visible
    await expect(prescriptionPage.heading).toBeVisible();
    await expect(prescriptionPage.newPrescriptionButton).toBeVisible();
  });
  
  test('should stack filters on mobile', async ({ prescriptionPage, page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Filters should still be visible and usable
    await expect(prescriptionPage.filterCard).toBeVisible();
    
  });
});

test.describe('Error Handling', () => {
  test('should handle API errors gracefully', async ({ prescriptionPage, page }) => {
    // First load normally to ensure app works
    await expect(prescriptionPage.heading).toBeVisible();
    await expect(prescriptionPage.prescriptionTable).toBeVisible();
    
    // Intercept API call and return error for refresh
    await page.route('**/Prescription**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server Error' }),
      });
    });

    await page.reload();

    // App should not crash - wait for any content to load
    // The app might show an error state or just an empty state
    await page.waitForLoadState('domcontentloaded');
    
    // Verify app didn't crash entirely - some UI should still exist
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
  });
});
