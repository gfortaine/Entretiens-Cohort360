import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { Toaster } from 'sonner';
import './i18n'; // Initialize i18n before app
import './styles/globals.css';
import App from './App.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Providers } from '@/providers';
import { logger } from '@/core/logger';
import { initWebVitals } from '@/core/monitoring';

// Log app initialization
logger.info('Application starting', {
  component: 'main',
  env: import.meta.env.MODE,
  version: import.meta.env.VITE_APP_VERSION || 'dev',
});

// Initialize Web Vitals tracking
initWebVitals();

// Global error handlers for unhandled errors
window.addEventListener('error', (event) => {
  logger.error('Unhandled error', event.error, {
    component: 'window',
    action: 'error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', event.reason, {
    component: 'window',
    action: 'unhandledrejection',
  });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Providers>
        <NuqsAdapter>
          <App />
          <Toaster 
            position="top-right"
            richColors
            closeButton
            duration={4000}
            toastOptions={{
              classNames: {
                toast: 'font-sans',
              },
            }}
          />
        </NuqsAdapter>
      </Providers>
    </ErrorBoundary>
  </StrictMode>,
);
