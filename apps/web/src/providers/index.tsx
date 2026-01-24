import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { logger } from '@/core/logger';

/**
 * QueryClient configuration with production-ready defaults
 * 
 * Features:
 * - Global error handling
 * - Retry configuration
 * - Stale time defaults
 * - Window focus refetch disabled (explicit refresh preferred)
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && 'status' in error) {
          const status = (error as unknown as { status: number }).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // 30 seconds default
      gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    },
    mutations: {
      retry: false, // Don't retry mutations by default
      onError: (error) => {
        logger.error('Mutation error', error, {
          component: 'QueryClient',
          action: 'mutation',
        });
      },
    },
  },
});

// Log query errors globally
queryClient.getQueryCache().subscribe((event) => {
  if (event.type === 'updated' && event.query.state.status === 'error') {
    const error = event.query.state.error;
    logger.error('Query error', error, {
      component: 'QueryClient',
      action: 'query',
      queryKey: JSON.stringify(event.query.queryKey),
    });
  }
});

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Application providers wrapper
 * Centralizes all context providers in one place
 */
export function Providers({ children }: ProvidersProps): ReactNode {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only in development */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}

export { queryClient };
