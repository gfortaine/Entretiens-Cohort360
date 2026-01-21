import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(() => true),
});
