import React from 'react';

const DivancoLoader = ({ size = 'medium', showLogo = true }) => {
  // Clases de tamaño
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {showLogo ? (
        <div className={`${sizeClasses[size]} relative`}>
          <img 
            src="/images/logoNaranja.png" 
            alt="Divanco Logo" 
            className="absolute inset-0 w-full h-full object-contain z-10"
          />
          <div className="absolute inset-0 w-full h-full animate-ping bg-blue-100 rounded-full opacity-30"></div>
          <div className="absolute inset-0 w-full h-full animate-pulse bg-white rounded-full"></div>
        </div>
      ) : (
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
      )}
      <p className="mt-3 text-sm text-gray-600 animate-pulse">
        Cargando contenido...
      </p>
    </div>
  );
};

// Componente para secciones específicas con loading
export const SectionLoader = ({ 
  isLoading, 
  children, 
  height = 'min-h-[300px]',
  showLogo = true,
  size = 'medium'
}) => {
  
  
  // IMPORTANTE: Si isLoading es true, mostramos el loader
  if (isLoading) {
    return (
      <div className={`${height} flex items-center justify-center bg-gray-50 rounded-lg shadow-sm`}>
        <DivancoLoader size={size} showLogo={showLogo} />
      </div>
    );
  }

  // Si isLoading es false, mostramos el contenido
  
  return children;
};

export default DivancoLoader;
