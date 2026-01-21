import { test as base } from '@playwright/test';
import { PrescriptionPage } from './pages/prescription.page';

/**
 * Playwright Fixtures for Cohort360 E2E Tests
 * Following best practices: fixture-injected Page Objects
 *
 * @see https://playwright.dev/docs/test-fixtures
 */

// Extend base test with our fixtures
type Fixtures = {
  prescriptionPage: PrescriptionPage;
};

export const test = base.extend<Fixtures>({
  prescriptionPage: async ({ page }, use) => {
    const prescriptionPage = new PrescriptionPage(page);
    await prescriptionPage.goto();
    await use(prescriptionPage);
  },
});

export { expect } from '@playwright/test';
