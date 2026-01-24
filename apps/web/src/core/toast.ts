/**
 * Toast notification utilities
 * Wraps Sonner with i18n support and consistent API
 */
import { toast as sonnerToast } from 'sonner';
import i18n from '@/i18n';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Show a toast notification
 * Supports i18n keys or plain strings
 */
function show(type: ToastType, message: string, options?: ToastOptions): string | number {
  // Try to translate the message if it looks like an i18n key
  const translatedMessage = message.includes('.') 
    ? i18n.t(message, { defaultValue: message })
    : message;
  
  const translatedDescription = options?.description?.includes('.')
    ? i18n.t(options.description, { defaultValue: options.description })
    : options?.description;

  const toastOptions = {
    description: translatedDescription,
    duration: options?.duration,
    action: options?.action ? {
      label: options.action.label.includes('.') 
        ? i18n.t(options.action.label, { defaultValue: options.action.label })
        : options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  };

  switch (type) {
    case 'success':
      return sonnerToast.success(translatedMessage, toastOptions);
    case 'error':
      return sonnerToast.error(translatedMessage, toastOptions);
    case 'warning':
      return sonnerToast.warning(translatedMessage, toastOptions);
    case 'info':
      return sonnerToast.info(translatedMessage, toastOptions);
    case 'loading':
      return sonnerToast.loading(translatedMessage, toastOptions);
    default:
      return sonnerToast(translatedMessage, toastOptions);
  }
}

/**
 * Toast utility with typed methods
 */
export const toast = {
  success(message: string, options?: ToastOptions) {
    return show('success', message, options);
  },

  error(message: string, options?: ToastOptions) {
    return show('error', message, options);
  },

  warning(message: string, options?: ToastOptions) {
    return show('warning', message, options);
  },

  info(message: string, options?: ToastOptions) {
    return show('info', message, options);
  },

  loading(message: string, options?: ToastOptions) {
    return show('loading', message, options);
  },

  /**
   * Promise-based toast for async operations
   * Shows loading → success/error automatically
   */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ): Promise<T> {
    sonnerToast.promise(promise, {
      loading: i18n.t(messages.loading, { defaultValue: messages.loading }),
      success: i18n.t(messages.success, { defaultValue: messages.success }),
      error: i18n.t(messages.error, { defaultValue: messages.error }),
    });
    return promise;
  },

  /**
   * Dismiss a specific toast or all toasts
   */
  dismiss(toastId?: string | number) {
    sonnerToast.dismiss(toastId);
  },
};

export default toast;
