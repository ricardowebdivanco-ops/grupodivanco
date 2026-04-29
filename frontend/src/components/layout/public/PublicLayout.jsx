import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../shared/ScrollToTop';
import WhatsApp from '../../ui/WhatsApp';
import LoadingBoundary, { LoadingSpinner } from '../../common/LoadingBoundary';

import React, { useState, useCallback } from 'react';

const PublicLayout = () => {
  const [hideHeader, setHideHeader] = useState(false);

  // Función para pasar a ProjectSection y actualizar visibilidad
  const handleProjectSectionVisible = useCallback((visible) => {
    setHideHeader(visible);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
      <ScrollToTop />
      <Header className={hideHeader ? 'hidden' : ''} />
      <main className="flex-1">
        <LoadingBoundary 
          loadingMessage="Cargando página..."
          fallback={<LoadingSpinner message="Cargando..." />}
        >
          <Suspense fallback={<LoadingSpinner message="Cargando contenido..." />}>
            {/* Pasar la función como prop a Outlet */}
            <Outlet context={{ handleProjectSectionVisible }} />
          </Suspense>
        </LoadingBoundary>
      </main>
      <Footer />
      {/* WhatsApp flotante */}
      <WhatsApp 
        phoneNumber="5491134567890" // Tu número de WhatsApp
        message="Hablemos"
      />
    </div>
  );
};

export default PublicLayout;