import React from 'react';
import { 
  ErrorBoundary, 
  LoadingBoundary, 
  useLoadingState, 
  useSmoothScroll 
} from '../common';

const TestPage = () => {
  const { isLoading, startLoading, stopLoading } = useLoadingState();
  const { scrollTo } = useSmoothScroll();

  const handleTestError = () => {
    throw new Error('Error de prueba para el ErrorBoundary');
  };

  const handleTestLoading = () => {
    startLoading();
    setTimeout(stopLoading, 2000);
  };

  const handleTestScroll = () => {
    scrollTo('#test-section', { offset: 80 });
  };

  return (
    <LoadingBoundary loadingMessage="Cargando página de pruebas...">
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Página de Pruebas - Mejoras Implementadas
          </h1>

          {/* Sección de pruebas */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold mb-6">Pruebas del Sistema</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={handleTestError}
                className="bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-colors"
              >
                Probar ErrorBoundary
              </button>
              
              <button
                onClick={handleTestLoading}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-3 px-4 rounded-lg transition-colors"
              >
                {isLoading ? 'Cargando...' : 'Probar Loading'}
              </button>
              
              <button
                onClick={handleTestScroll}
                className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors"
              >
                Probar Scroll Suave
              </button>
            </div>
          </div>

          {/* Contenido de ejemplo */}
          <div className="space-y-8">
            {[1, 2, 3, 4, 5].map((num) => (
              <section 
                key={num}
                id={num === 3 ? 'test-section' : `section-${num}`}
                className="bg-white rounded-lg shadow p-8"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Sección {num} 
                  {num === 3 && ' (Objetivo del scroll)'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Esta es la sección número {num}. Contiene contenido de ejemplo para 
                  demostrar las funcionalidades de scroll suave y navegación entre 
                  secciones. El sistema de loading boundaries protege todo el contenido 
                  y el ErrorBoundary maneja cualquier error que pueda ocurrir.
                </p>
                {num === 3 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-800 font-medium">
                      🎯 ¡Has llegado a la sección objetivo!
                    </p>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Resumen de mejoras implementadas */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              ✅ Mejoras Implementadas
            </h2>
            <ul className="space-y-2 text-blue-800">
              <li>• Sistema de ErrorBoundary con recuperación inteligente</li>
              <li>• LoadingBoundary con estados de carga elegantes</li>
              <li>• Utilidades de scroll suave con múltiples fallbacks</li>
              <li>• Navegación entre secciones de homepage</li>
              <li>• Botón ScrollToTop con animaciones</li>
              <li>• Hooks personalizados para gestión de estado</li>
              <li>• Tipografía elegante aplicada consistentemente</li>
              <li>• Corrección de problemas en Header y SloganPage</li>
            </ul>
          </div>
        </div>
      </div>
    </LoadingBoundary>
  );
};

export default TestPage;
