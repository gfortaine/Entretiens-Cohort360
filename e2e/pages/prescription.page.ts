import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Prescription Management App
 * Updated for shadcn/ui components with accessibility-first locators
 *
 * @see https://playwright.dev/docs/pom
 */
export class PrescriptionPage {
  readonly page: Page;

  // Header & Navigation
  readonly heading: Locator;
  readonly appTitle: Locator;
  readonly languageSwitcher: Locator;

  // Action Buttons
  readonly newPrescriptionButton: Locator;
  readonly toggleFiltersButton: Locator;
  readonly refreshButton: Locator;

  // Dialog Form Elements (New Prescription Dialog)
  readonly dialog: Locator;
  readonly dialogPatientSelect: Locator;
  readonly dialogMedicationSelect: Locator;
  readonly dialogStartDateInput: Locator;
  readonly dialogEndDateInput: Locator;
  readonly dialogStatusSelect: Locator;
  readonly dialogSubmitButton: Locator;
  readonly dialogCancelButton: Locator;

  // Filter Elements (Filter Card)
  readonly filterCard: Locator;
  readonly filterPatientSelect: Locator;
  readonly filterMedicationSelect: Locator;
  readonly filterStatusSelect: Locator;
  readonly clearFiltersButton: Locator;

  // Date Picker Filters
  readonly filterStartDateFrom: Locator;
  readonly filterStartDateTo: Locator;
  readonly filterEndDateFrom: Locator;
  readonly filterEndDateTo: Locator;

  // Table Elements
  readonly prescriptionTable: Locator;
  readonly tableRows: Locator;
  readonly emptyState: Locator;
  readonly loadingState: Locator;

  // Pagination
  readonly pagination: Locator;
  readonly paginationPrev: Locator;
  readonly paginationNext: Locator;
  readonly prescriptionCount: Locator;

  // Legacy aliases for backward compatibility
  readonly patientSelect: Locator;
  readonly medicationSelect: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly statusSelect: Locator;
  readonly commentInput: Locator;
  readonly submitButton: Locator;
  readonly filterStatus: Locator;
  readonly applyFiltersButton: Locator;
  readonly prescriptionCards: Locator;

  // Feedback Elements
  readonly successBanner: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.heading = page.getByRole('heading', { level: 1 });
    this.appTitle = page.getByRole('heading', { name: /prescription/i });
    this.languageSwitcher = page.locator('[data-testid="language-switcher"]');

    // Action Buttons
    this.newPrescriptionButton = page.getByRole('button', { name: /nouvelle prescription|new prescription/i });
    this.toggleFiltersButton = page.getByRole('button', { name: /filtres|filters/i });
    this.refreshButton = page.getByRole('button').filter({ has: page.locator('svg.lucide-refresh-cw') });

    // Dialog Form (shadcn Dialog with Select components)
    this.dialog = page.getByRole('dialog');
    this.dialogPatientSelect = this.dialog.locator('#form-patient');
    this.dialogMedicationSelect = this.dialog.locator('#form-medication');
    this.dialogStartDateInput = this.dialog.locator('#form-start-date');
    this.dialogEndDateInput = this.dialog.locator('#form-end-date');
    this.dialogStatusSelect = this.dialog.locator('#form-status');
    this.dialogSubmitButton = this.dialog.getByRole('button', { name: /créer|create/i });
    this.dialogCancelButton = this.dialog.getByRole('button', { name: /annuler|cancel/i });

    // Filter Card (using shadcn Select triggers)
    this.filterCard = page.locator('[data-slot="card"]').filter({ hasText: /filtres|filters/i });
    this.filterPatientSelect = page.locator('#patient');
    this.filterMedicationSelect = page.locator('#medication');
    this.filterStatusSelect = page.locator('#status');
    this.clearFiltersButton = page.getByRole('button', { name: /effacer|clear/i });

    // Date Picker Filters (shadcn Popover buttons)
    this.filterStartDateFrom = page.getByRole('button', { name: /début.*du|start.*from|choisir une date/i }).first();
    this.filterStartDateTo = page.getByRole('button', { name: /début.*au|start.*to/i });
    this.filterEndDateFrom = page.getByRole('button', { name: /fin.*du|end.*from/i });
    this.filterEndDateTo = page.getByRole('button', { name: /fin.*au|end.*to/i });

    // Table
    this.prescriptionTable = page.getByRole('table');
    this.tableRows = page.locator('tbody tr');
    this.emptyState = page.getByText(/aucune prescription|no prescription/i);
    this.loadingState = page.locator('[data-slot="skeleton"]');

    // Pagination
    this.pagination = page.locator('nav[aria-label*="pagination"]');
    this.paginationPrev = page.getByRole('link', { name: /précédent|previous/i });
    this.paginationNext = page.getByRole('link', { name: /suivant|next/i });
    this.prescriptionCount = page.getByText(/\d+ prescription/i);

    // Legacy aliases
    this.patientSelect = this.dialogPatientSelect;
    this.medicationSelect = this.dialogMedicationSelect;
    this.startDateInput = this.dialogStartDateInput;
    this.endDateInput = this.dialogEndDateInput;
    this.statusSelect = this.dialogStatusSelect;
    this.commentInput = this.dialog.locator('#dialog-comment');
    this.submitButton = this.dialogSubmitButton;
    this.filterStatus = this.filterStatusSelect;
    this.applyFiltersButton = page.getByRole('button', { name: /appliquer/i });
    this.prescriptionCards = this.tableRows;

    // Feedback
    this.successBanner = page.getByRole('status');
    this.errorBanner = page.getByRole('alert');
  }

  async goto(params?: Record<string, string>) {
    const url = params ? `/?${new URLSearchParams(params).toString()}` : '/';
    await this.page.goto(url);
    await this.waitForLoad();
  }

  async waitForLoad() {
    // Wait for the app to be interactive
    await expect(this.heading).toBeVisible({ timeout: 10000 });
    // Wait for API data to load
    await this.page.waitForResponse(
      (response) => response.url().includes('/Prescription') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => {
      // API might have already loaded, continue
    });
  }

  async openNewPrescriptionDialog() {
    await this.newPrescriptionButton.click();
    await expect(this.dialog).toBeVisible();
  }

  async closeDialog() {
    await this.dialogCancelButton.click();
    await expect(this.dialog).not.toBeVisible();
  }

  async createPrescription(data: {
    patient?: string;
    medication?: string;
    startDate: string;
    endDate: string;
    status?: string;
    comment?: string;
  }) {
    await this.openNewPrescriptionDialog();

    // Select patient (shadcn Select component)
    if (data.patient) {
      await this.dialogPatientSelect.click();
      await this.page.getByRole('option', { name: new RegExp(data.patient, 'i') }).click();
    }

    // Select medication
    if (data.medication) {
      await this.dialogMedicationSelect.click();
      await this.page.getByRole('option', { name: new RegExp(data.medication, 'i') }).click();
    }

    // Fill dates
    await this.dialogStartDateInput.fill(data.startDate);
    await this.dialogEndDateInput.fill(data.endDate);

    // Select status
    if (data.status) {
      await this.dialogStatusSelect.click();
      await this.page.getByRole('option', { name: new RegExp(data.status, 'i') }).click();
    }

    // Add comment
    if (data.comment) {
      await this.commentInput.fill(data.comment);
    }

    await this.dialogSubmitButton.click();
  }

  async waitForSuccess() {
    await expect(this.dialog).not.toBeVisible({ timeout: 5000 });
  }

  async waitForError() {
    await expect(this.errorBanner).toBeVisible({ timeout: 5000 });
  }

  // Filter methods using shadcn Select components (Radix UI based)
  async selectFilterPatient(patientName: string) {
    await this.filterPatientSelect.click();
    // Wait for the content to appear then click the option
    const content = this.page.locator('[data-slot="select-content"]');
    await expect(content).toBeVisible();
    await content.locator('[data-slot="select-item"]', { hasText: new RegExp(patientName, 'i') }).click();
  }

  async selectFilterMedication(medicationName: string) {
    await this.filterMedicationSelect.click();
    const content = this.page.locator('[data-slot="select-content"]');
    await expect(content).toBeVisible();
    await content.locator('[data-slot="select-item"]', { hasText: new RegExp(medicationName, 'i') }).click();
  }

  async selectFilterStatus(status: string) {
    await this.filterStatusSelect.click();
    const content = this.page.locator('[data-slot="select-content"]');
    await expect(content).toBeVisible();
    // Map status values to their expected translated text
    const statusMap: Record<string, string[]> = {
      'valide': ['valide', 'valid'],
      'en_attente': ['attente', 'pending', 'en attente'],
      'suppr': ['suppr', 'deleted', 'supprimée'],
      'all': ['tous', 'all'],
    };
    const patterns = statusMap[status.toLowerCase()] || [status];
    const pattern = new RegExp(patterns.join('|'), 'i');
    await content.locator('[data-slot="select-item"]', { hasText: pattern }).click();
  }

  async selectDateFilter(filterButton: Locator, day: number) {
    await filterButton.click();
    // Wait for calendar popover
    const calendar = this.page.locator('[data-slot="popover-content"]');
    await expect(calendar).toBeVisible();
    // Click on the day - wait a bit for calendar to be interactive
    await this.page.waitForTimeout(200);
    await calendar.getByRole('gridcell', { name: String(day), exact: true }).click();
    // Wait for popover to close
    await expect(calendar).not.toBeVisible({ timeout: 3000 }).catch(() => {
      // Sometimes the calendar stays open, click outside to close
      this.page.locator('body').click({ position: { x: 0, y: 0 } });
    });
  }

  async clearFilters() {
    if (await this.clearFiltersButton.isVisible()) {
      await this.clearFiltersButton.click();
    }
  }

  async getPrescriptionCount(): Promise<number> {
    await this.page.waitForTimeout(500); // Let table settle
    return await this.tableRows.count();
  }

  async getTableRowByIndex(index: number): Promise<Locator> {
    return this.tableRows.nth(index);
  }

  async getPrescriptionByIndex(index: number): Promise<Locator> {
    return this.tableRows.nth(index);
  }

  async deletePrescription(index: number) {
    const row = await this.getTableRowByIndex(index);
    const deleteButton = row.getByRole('button', { name: /supprimer|delete/i });
    await deleteButton.click();
  }

  // URL State helpers
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getUrlParams(): Promise<URLSearchParams> {
    const url = new URL(this.page.url());
    return url.searchParams;
  }

  async goToPage(pageNumber: number) {
    const pageLink = this.pagination.getByRole('link', { name: String(pageNumber) });
    await pageLink.click();
  }

  async navigateToNextPage() {
    await this.paginationNext.click();
  }

  async navigateToPrevPage() {
    await this.paginationPrev.click();
  }

  // Legacy compatibility
  async filterByPatient(patientName: string) {
    await this.selectFilterPatient(patientName);
  }

  async filterByStatus(status: string) {
    await this.selectFilterStatus(status);
  }
}
