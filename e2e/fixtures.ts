import { test as base, Page } from '@playwright/test';

/**
 * Example Page Object
 * 
 * Page Objects encapsulate page-specific selectors and actions.
 * Replace this with your actual page objects.
 */
export class ExamplePage {
  constructor(private page: Page) {}

  // ============ SELECTORS ============
  
  /** Main heading */
  get heading() {
    return this.page.getByRole('heading', { level: 1 });
  }

  /** Primary action button */
  get primaryButton() {
    return this.page.getByRole('button', { name: /submit|save|create/i });
  }

  /** Main content area */
  get mainContent() {
    return this.page.locator('#root, main, [role="main"], [data-testid="main"]').first();
  }

  // ============ ACTIONS ============

  /** Navigate to the page */
  async goto(path = '/') {
    await this.page.goto(path);
  }

  /** Wait for page to be ready */
  async waitForReady() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.heading.waitFor({ state: 'visible' });
  }

  /** Get current URL parameters */
  async getUrlParams(): Promise<URLSearchParams> {
    const url = new URL(this.page.url());
    return url.searchParams;
  }
}

/**
 * Playwright Fixtures
 * 
 * Fixtures provide reusable test setup and teardown.
 * Add your page objects here.
 * 
 * @see https://playwright.dev/docs/test-fixtures
 */
type Fixtures = {
  examplePage: ExamplePage;
};

export const test = base.extend<Fixtures>({
  examplePage: async ({ page }, use) => {
    const examplePage = new ExamplePage(page);
    await examplePage.goto();
    await use(examplePage);
  },
});

export { expect } from '@playwright/test';
