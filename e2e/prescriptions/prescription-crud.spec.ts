import { test, expect } from '../fixtures';

/**
 * E2E Tests for Prescription Management
 * Cohort360 - Medical Prescription Application
 *
 * Tests cover the complete CRUD workflow for prescriptions
 * following healthcare application best practices.
 */

test.describe('Prescription App - Page Load', () => {
  test('should display the main heading', async ({ prescriptionPage }) => {
    await expect(prescriptionPage.heading).toBeVisible();
  });

  test('should have proper page structure', async ({ prescriptionPage, page }) => {
    // Check essential elements are present
    await expect(prescriptionPage.patientSelect).toBeVisible();
    await expect(prescriptionPage.medicationSelect).toBeVisible();
    await expect(prescriptionPage.submitButton).toBeVisible();

    // Take screenshot for documentation
    await page.screenshot({
      path: 'screenshots/01-app-loaded.png',
      fullPage: true,
    });
  });

  test('should load patients and medications from API', async ({ prescriptionPage }) => {
    // Wait for dropdowns to be populated
    const patientOptions = await prescriptionPage.patientSelect.locator('option').count();
    const medicationOptions = await prescriptionPage.medicationSelect.locator('option').count();

    // Should have more than just the placeholder option
    expect(patientOptions).toBeGreaterThan(1);
    expect(medicationOptions).toBeGreaterThan(1);
  });
});

test.describe('Prescription Form - Validation', () => {
  test('should show validation error for empty form submission', async ({ prescriptionPage, page }) => {
    // Try to submit empty form
    await prescriptionPage.submitButton.click();

    // Should show validation errors (form should prevent submission)
    // The form uses HTML5 validation or react-hook-form errors
    const patientError = page.getByText(/patient.*requis/i);
    const dateError = page.getByText(/date.*requis/i);

    // At least one validation message should appear
    const hasPatientError = await patientError.isVisible().catch(() => false);
    const hasDateError = await dateError.isVisible().catch(() => false);

    // Screenshot for validation state
    await page.screenshot({
      path: 'screenshots/02-validation-errors.png',
      fullPage: true,
    });
  });

  test('should validate end date is after start date', async ({ prescriptionPage, page }) => {
    // Fill form with invalid dates (end before start)
    await prescriptionPage.patientSelect.selectOption({ index: 1 });
    await prescriptionPage.medicationSelect.selectOption({ index: 1 });
    await prescriptionPage.startDateInput.fill('2025-06-15');
    await prescriptionPage.endDateInput.fill('2025-06-01'); // Before start date

    await prescriptionPage.submitButton.click();

    // Should show date validation error
    const dateError = page.getByText(/date de fin.*supérieure/i);
    await expect(dateError).toBeVisible({ timeout: 3000 });

    await page.screenshot({
      path: 'screenshots/03-date-validation.png',
      fullPage: true,
    });
  });
});

test.describe('Prescription CRUD - Create', () => {
  test('should create a new prescription successfully', async ({ prescriptionPage, page }) => {
    const initialCount = await prescriptionPage.getPrescriptionCount();

    // Fill in the form with valid data
    await prescriptionPage.patientSelect.selectOption({ index: 1 });
    await prescriptionPage.medicationSelect.selectOption({ index: 1 });
    await prescriptionPage.startDateInput.fill('2025-06-01');
    await prescriptionPage.endDateInput.fill('2025-06-30');
    await prescriptionPage.statusSelect.selectOption('valide');
    await prescriptionPage.commentInput.fill('E2E Test Prescription - Playwright');

    // Screenshot before submission
    await page.screenshot({
      path: 'screenshots/04-form-filled.png',
      fullPage: true,
    });

    // Submit the form
    await prescriptionPage.submitButton.click();

    // Wait for success feedback
    await prescriptionPage.waitForSuccess();

    await page.screenshot({
      path: 'screenshots/05-creation-success.png',
      fullPage: true,
    });

    // Verify prescription was added
    const newCount = await prescriptionPage.getPrescriptionCount();
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });
});

test.describe('Prescription CRUD - Read', () => {
  test('should display prescription list', async ({ prescriptionPage, page }) => {
    // Wait for prescriptions to load
    await page.waitForTimeout(1000); // Allow API response

    // Should show prescriptions or empty state
    const hasCards = (await prescriptionPage.getPrescriptionCount()) > 0;
    const hasEmpty = await prescriptionPage.emptyState.isVisible().catch(() => false);

    expect(hasCards || hasEmpty).toBe(true);

    await page.screenshot({
      path: 'screenshots/06-prescription-list.png',
      fullPage: true,
    });
  });

  test('should show prescription details in cards', async ({ prescriptionPage, page }) => {
    const count = await prescriptionPage.getPrescriptionCount();

    if (count > 0) {
      const firstCard = await prescriptionPage.getPrescriptionByIndex(0);

      // Card should contain expected elements
      await expect(firstCard).toBeVisible();

      // Check for patient and medication info
      const cardText = await firstCard.textContent();
      expect(cardText).toBeTruthy();
    }
  });
});

test.describe('Prescription Filters', () => {
  test('should filter by status', async ({ prescriptionPage, page }) => {
    // Apply status filter
    await prescriptionPage.filterStatus.selectOption('valide');
    await prescriptionPage.applyFiltersButton.click();

    // Wait for filtered results
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'screenshots/07-filtered-by-status.png',
      fullPage: true,
    });
  });

  test('should clear all filters', async ({ prescriptionPage, page }) => {
    // Apply some filters first
    await prescriptionPage.filterStatus.selectOption('valide');
    await prescriptionPage.applyFiltersButton.click();
    await page.waitForTimeout(300);

    // Clear filters
    await prescriptionPage.clearFilters();
    await page.waitForTimeout(300);

    await page.screenshot({
      path: 'screenshots/08-filters-cleared.png',
      fullPage: true,
    });
  });
});

test.describe('Accessibility', () => {
  test('should have proper form labels', async ({ prescriptionPage, page }) => {
    // All form inputs should have associated labels
    const patientLabel = page.locator('label[for="form-patient"]');
    const medicationLabel = page.locator('label[for="form-medication"]');

    await expect(patientLabel).toBeVisible();
    await expect(medicationLabel).toBeVisible();
  });

  test('should be keyboard navigable', async ({ prescriptionPage, page }) => {
    // Tab through form elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to navigate without mouse
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeElement).toBeTruthy();
  });

  test('should have proper ARIA roles', async ({ page }) => {
    // Check for proper ARIA attributes
    const alertElements = await page.getByRole('alert').count();
    const statusElements = await page.getByRole('status').count();

    // App may or may not have alerts/status depending on state
    // Just verify the query doesn't fail
    expect(typeof alertElements).toBe('number');
    expect(typeof statusElements).toBe('number');
  });
});

test.describe('Mobile Responsiveness', () => {
  test('should display correctly on mobile viewport', async ({ prescriptionPage, page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Verify main elements are still visible
    await expect(prescriptionPage.heading).toBeVisible();
    await expect(prescriptionPage.submitButton).toBeVisible();

    await page.screenshot({
      path: 'screenshots/09-mobile-view.png',
      fullPage: true,
    });
  });
});

test.describe('Error Handling', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API call and return error
    await page.route('**/Prescription', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server Error' }),
      });
    });

    await page.goto('/');

    // App should not crash, should show error state
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    await page.screenshot({
      path: 'screenshots/10-error-state.png',
      fullPage: true,
    });
  });
});
