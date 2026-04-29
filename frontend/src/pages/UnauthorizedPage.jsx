import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Opcional: redirigir automáticamente al login después de 3 segundos
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icono */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-6">
              <LockClosedIcon className="w-16 h-16 text-red-600" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Acceso No Autorizado
          </h1>

          {/* Código de error */}
          <div className="inline-block bg-red-50 text-red-600 px-4 py-2 rounded-lg font-mono text-sm mb-4">
            Error 401
          </div>

          {/* Mensaje */}
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a esta página. Por favor, inicia sesión con una cuenta autorizada.
          </p>

          {/* Contador de redirección */}
          <p className="text-sm text-gray-500 mb-6">
            Serás redirigido al login en 5 segundos...
          </p>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGoBack}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Volver
            </button>
            <button
              onClick={handleGoToLogin}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <LockClosedIcon className="w-5 h-5" />
              Ir al Login
            </button>
          </div>

          {/* Info adicional */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Si crees que esto es un error, contacta al administrador del sistema.
            </p>
          </div>
        </div>

        {/* Link a inicio */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
