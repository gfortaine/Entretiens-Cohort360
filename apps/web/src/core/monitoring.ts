/**
 * Performance monitoring utilities
 * 
 * Provides hooks and utilities for tracking app performance metrics
 * that can be sent to monitoring services (Datadog, New Relic, etc.)
 */
import { useEffect, useRef, useCallback } from 'react';
import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'count' | 'bytes';
  tags?: Record<string, string>;
}

/**
 * Report a performance metric
 * In production, this would send to monitoring service
 */
export function reportMetric(metric: PerformanceMetric): void {
  logger.debug('Performance metric', {
    component: 'monitoring',
    action: 'metric',
    ...metric,
  });

  // Production: send to monitoring service
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    // Example: datadog.gauge(metric.name, metric.value, { tags: metric.tags });
    // Example: newrelic.recordMetric(metric.name, metric.value);
  }
}

/**
 * Track Web Vitals (LCP, FID, CLS, etc.)
 */
export function initWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Track Largest Contentful Paint
  const lcpObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    reportMetric({
      name: 'web_vitals.lcp',
      value: lastEntry.startTime,
      unit: 'ms',
    });
  });
  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

  // Track First Input Delay
  const fidObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    entries.forEach((entry) => {
      if ('processingStart' in entry) {
        const fidEntry = entry as PerformanceEventTiming;
        reportMetric({
          name: 'web_vitals.fid',
          value: fidEntry.processingStart - fidEntry.startTime,
          unit: 'ms',
        });
      }
    });
  });
  fidObserver.observe({ type: 'first-input', buffered: true });

  // Track Cumulative Layout Shift
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    entries.forEach((entry) => {
      if ('hadRecentInput' in entry) {
        const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
        }
      }
    });
  });
  clsObserver.observe({ type: 'layout-shift', buffered: true });

  // Report CLS on page hide
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      reportMetric({
        name: 'web_vitals.cls',
        value: clsValue,
        unit: 'count',
      });
    }
  });
}

/**
 * Hook to track component render performance
 * 
 * @example
 * function MyComponent() {
 *   useRenderPerformance('MyComponent');
 *   return <div>...</div>;
 * }
 */
export function useRenderPerformance(componentName: string): void {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    // Only log if re-rendering too frequently (potential performance issue)
    if (timeSinceLastRender < 16 && renderCount.current > 1) {
      logger.warn('Rapid re-render detected', {
        component: componentName,
        action: 'render',
        duration: Math.round(timeSinceLastRender),
      });
    }
  });
}

/**
 * Hook to track async operation performance
 * 
 * @example
 * const trackAsync = useAsyncPerformance('fetchPrescriptions');
 * const data = await trackAsync(fetchData());
 */
export function useAsyncPerformance(operationName: string) {
  return useCallback(
    async <T>(promise: Promise<T>): Promise<T> => {
      const start = performance.now();
      try {
        const result = await promise;
        const duration = Math.round(performance.now() - start);
        
        reportMetric({
          name: `async.${operationName}`,
          value: duration,
          unit: 'ms',
          tags: { status: 'success' },
        });
        
        return result;
      } catch (error) {
        const duration = Math.round(performance.now() - start);
        
        reportMetric({
          name: `async.${operationName}`,
          value: duration,
          unit: 'ms',
          tags: { status: 'error' },
        });
        
        throw error;
      }
    },
    [operationName]
  );
}

/**
 * Track memory usage (if available)
 */
export function reportMemoryUsage(): void {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
    
    reportMetric({
      name: 'memory.used_heap',
      value: memory.usedJSHeapSize,
      unit: 'bytes',
    });
    
    reportMetric({
      name: 'memory.total_heap',
      value: memory.totalJSHeapSize,
      unit: 'bytes',
    });
  }
}

export default {
  reportMetric,
  initWebVitals,
  useRenderPerformance,
  useAsyncPerformance,
  reportMemoryUsage,
};
