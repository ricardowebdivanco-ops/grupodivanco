import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // ✅ MEJORADO: Scroll más suave y confiable
    const scrollToTop = () => {
      try {
        // Opción 1: Scroll inmediato para cambios de ruta
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant' // Cambio inmediato en navegación
        });

        // ✅ FALLBACK: Si el scroll suave no funciona
        if (window.pageYOffset !== 0) {
          window.scrollTo(0, 0);
        }
      } catch (error) {
        console.warn('Error en ScrollToTop:', error);
        // Fallback básico
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };

    // ✅ TIMEOUT para asegurar que el DOM esté listo
    const timeoutId = setTimeout(scrollToTop, 0);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
};

export default ScrollToTop;