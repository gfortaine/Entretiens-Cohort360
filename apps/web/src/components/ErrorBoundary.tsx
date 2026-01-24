import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger, reportError } from '@/core/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Production-ready Error Boundary
 * 
 * Features:
 * - Catches React rendering errors
 * - Reports to monitoring (logger/Sentry)
 * - User-friendly fallback UI
 * - Recovery options (retry, go home)
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log and report the error
    logger.error('React Error Boundary caught error', error, {
      component: 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
    });
    
    reportError(error, {
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    logger.info('User triggered error recovery', { component: 'ErrorBoundary' });
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = (): void => {
    logger.info('User navigated home from error', { component: 'ErrorBoundary' });
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback 
          error={this.state.error}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default error fallback UI component
 */
interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
  onGoHome: () => void;
}

function ErrorFallback({ error, onRetry, onGoHome }: ErrorFallbackProps): ReactNode {
  const { t } = useTranslation();
  const isProduction = import.meta.env.PROD;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">
            {t('errorBoundary.title', 'Une erreur est survenue')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            {t('errorBoundary.message', 'Nous sommes désolés, quelque chose s\'est mal passé. Notre équipe a été notifiée.')}
          </p>
          
          {/* Show error details in development */}
          {!isProduction && error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                {t('errorBoundary.details', 'Détails techniques')}
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs">
                <code>{error.message}</code>
                {error.stack && (
                  <>
                    <br /><br />
                    <code className="text-muted-foreground">{error.stack}</code>
                  </>
                )}
              </pre>
            </details>
          )}
          
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={onRetry} variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('errorBoundary.retry', 'Réessayer')}
            </Button>
            <Button onClick={onGoHome} variant="outline">
              <Home className="mr-2 h-4 w-4" />
              {t('errorBoundary.home', 'Retour à l\'accueil')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ErrorBoundary;
