import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Prescription Management App
 * Following Playwright best practices: accessibility-first locators
 *
 * @see https://playwright.dev/docs/pom
 */
export class PrescriptionPage {
  readonly page: Page;

  // Header & Navigation
  readonly heading: Locator;
  readonly appTitle: Locator;

  // Form Elements - Accessibility-first locators
  readonly patientSelect: Locator;
  readonly medicationSelect: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly statusSelect: Locator;
  readonly commentInput: Locator;
  readonly submitButton: Locator;

  // Filter Elements
  readonly filterPatient: Locator;
  readonly filterMedication: Locator;
  readonly filterStatus: Locator;
  readonly filterStartDateFrom: Locator;
  readonly filterStartDateTo: Locator;
  readonly filterEndDateFrom: Locator;
  readonly filterEndDateTo: Locator;
  readonly applyFiltersButton: Locator;
  readonly clearFiltersButton: Locator;

  // List Elements
  readonly prescriptionList: Locator;
  readonly prescriptionCards: Locator;
  readonly emptyState: Locator;
  readonly loadingState: Locator;

  // Feedback Elements
  readonly successBanner: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.heading = page.getByRole('heading', { level: 1 });
    this.appTitle = page.getByRole('heading', { name: /prescription/i });

    // Form - Using accessibility-first locators
    this.patientSelect = page.getByLabel(/patient/i).first();
    this.medicationSelect = page.getByLabel(/médicament/i);
    this.startDateInput = page.getByLabel(/date de début/i);
    this.endDateInput = page.getByLabel(/date de fin/i);
    this.statusSelect = page.locator('#form-status');
    this.commentInput = page.getByLabel(/commentaire/i);
    this.submitButton = page.getByRole('button', { name: /créer|enregistrer/i });

    // Filters
    this.filterPatient = page.locator('#filter-patient');
    this.filterMedication = page.locator('#filter-medication');
    this.filterStatus = page.locator('#filter-status');
    this.filterStartDateFrom = page.locator('#filter-date_debut_from');
    this.filterStartDateTo = page.locator('#filter-date_debut_to');
    this.filterEndDateFrom = page.locator('#filter-date_fin_from');
    this.filterEndDateTo = page.locator('#filter-date_fin_to');
    this.applyFiltersButton = page.getByRole('button', { name: /appliquer/i });
    this.clearFiltersButton = page.getByRole('button', { name: /réinitialiser/i });

    // List
    this.prescriptionList = page.locator('.prescription-list');
    this.prescriptionCards = page.locator('.prescription-card');
    this.emptyState = page.getByText(/aucune prescription/i);
    this.loadingState = page.getByText(/chargement/i);

    // Feedback
    this.successBanner = page.getByRole('status');
    this.errorBanner = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/');
    await this.waitForLoad();
  }

  async waitForLoad() {
    // Wait for the app to be interactive
    await expect(this.heading).toBeVisible({ timeout: 10000 });
    // Wait for API data to load
    await this.page.waitForResponse(
      (response) => response.url().includes('/Patient') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => {
      // API might have already loaded, continue
    });
  }

  async createPrescription(data: {
    patient: string;
    medication: string;
    startDate: string;
    endDate: string;
    status?: string;
    comment?: string;
  }) {
    await this.patientSelect.selectOption({ label: new RegExp(data.patient, 'i') });
    await this.medicationSelect.selectOption({ label: new RegExp(data.medication, 'i') });
    await this.startDateInput.fill(data.startDate);
    await this.endDateInput.fill(data.endDate);

    if (data.status) {
      await this.statusSelect.selectOption(data.status);
    }

    if (data.comment) {
      await this.commentInput.fill(data.comment);
    }

    await this.submitButton.click();
  }

  async waitForSuccess() {
    await expect(this.successBanner).toBeVisible({ timeout: 5000 });
  }

  async waitForError() {
    await expect(this.errorBanner).toBeVisible({ timeout: 5000 });
  }

  async filterByPatient(patientName: string) {
    await this.filterPatient.selectOption({ label: new RegExp(patientName, 'i') });
    await this.applyFiltersButton.click();
  }

  async filterByStatus(status: string) {
    await this.filterStatus.selectOption(status);
    await this.applyFiltersButton.click();
  }

  async clearFilters() {
    await this.clearFiltersButton.click();
  }

  async getPrescriptionCount(): Promise<number> {
    return await this.prescriptionCards.count();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage: true,
    });
  }

  async getPrescriptionByIndex(index: number): Promise<Locator> {
    return this.prescriptionCards.nth(index);
  }

  async deletePrescription(index: number) {
    const card = await this.getPrescriptionByIndex(index);
    const deleteButton = card.getByRole('button', { name: /supprimer|delete/i });
    await deleteButton.click();
  }
}
