import React, { Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';

// Componente de Loading elegante
const LoadingSpinner = ({ 
  size = 'default', 
  message = 'Cargando...', 
  showMessage = true 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <svg 
          className="w-full h-full text-blue-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
      </div>
      {showMessage && (
        <p className="mt-4 text-sm text-gray-600 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

// Componente principal LoadingBoundary
const LoadingBoundary = ({ 
  children, 
  fallback, 
  loadingMessage = 'Cargando contenido...',
  errorFallback,
  onError 
}) => {
  // Fallback por defecto si no se proporciona uno
  const defaultFallback = (
    <div className="min-h-[200px] flex items-center justify-center">
      <LoadingSpinner message={loadingMessage} />
    </div>
  );

  // Manejar errores de carga
  const handleError = (error, errorInfo) => {
    console.error('Error en LoadingBoundary:', error);
    if (onError) {
      onError(error, errorInfo);
    }
  };

  return (
    <ErrorBoundary onError={handleError} fallback={errorFallback}>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// Hook personalizado para manejar estados de carga
export const useLoadingState = (initialLoading = false) => {
  const [isLoading, setIsLoading] = React.useState(initialLoading);
  const [error, setError] = React.useState(null);

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const setErrorState = (error) => {
    setError(error);
    setIsLoading(false);
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
  };

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError: setErrorState,
    reset
  };
};

// Componente para estados de carga inline
export const InlineLoader = ({ 
  isLoading, 
  children, 
  loadingComponent,
  className = '' 
}) => {
  if (isLoading) {
    return loadingComponent || (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        <LoadingSpinner size="small" showMessage={false} />
      </div>
    );
  }

  return children;
};

// Componente para páginas completas con loading
export const PageLoader = ({ 
  isLoading, 
  children, 
  message = 'Cargando página...' 
}) => {
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" message={message} />
      </div>
    );
  }

  return children;
};

export default LoadingBoundary;
export { LoadingSpinner };
