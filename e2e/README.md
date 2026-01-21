# E2E Tests

This directory contains Playwright E2E tests using the **Page Object Model** pattern.

## Structure

```
e2e/
├── fixtures.ts              # Playwright fixtures setup
├── pages/
│   └── example.page.ts      # Page Object example
└── tests/
    └── example.spec.ts      # Test example
```

## Quick Start

```bash
# Run all E2E tests
npm run e2e

# Run in UI mode (recommended for development)
npm run e2e:ui

# Run specific test file
npx playwright test e2e/tests/example.spec.ts
```

## Page Object Model Pattern

Page Objects encapsulate page-specific selectors and actions:

```typescript
// e2e/pages/example.page.ts
export class ExamplePage {
  constructor(private page: Page) {}
  
  // Selectors
  get heading() { return this.page.getByRole('heading', { level: 1 }); }
  get submitButton() { return this.page.getByRole('button', { name: /submit/i }); }
  
  // Actions
  async goto() { await this.page.goto('/'); }
  async submit() { await this.submitButton.click(); }
}
```

## Fixtures Pattern

Fixtures provide reusable test setup:

```typescript
// e2e/fixtures.ts
export const test = base.extend<{ examplePage: ExamplePage }>({
  examplePage: async ({ page }, use) => {
    const examplePage = new ExamplePage(page);
    await examplePage.goto();
    await use(examplePage);
  },
});
```

## Writing Tests

```typescript
// e2e/tests/example.spec.ts
import { test, expect } from '../fixtures';

test.describe('Feature Name', () => {
  test('should do something', async ({ examplePage }) => {
    await expect(examplePage.heading).toBeVisible();
  });
});
```

## Best Practices

1. **One Page Object per page/feature**
2. **Use data-testid for stable selectors**
3. **Avoid hard-coded waits** - use Playwright's auto-waiting
4. **Keep tests independent** - no test should depend on another
5. **Use fixtures** for common setup/teardown
