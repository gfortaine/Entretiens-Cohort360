import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import fr from '../i18n/locales/fr.json';
import en from '../i18n/locales/en.json';

// Initialize i18n for tests
i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(() => true),
});
