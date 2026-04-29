
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { scrollToSection } from '../../../utils/simpleScroll';
import { useGetHeroImageQuery } from '../../../features/siteSettings/siteSettingsApi';

const DEFAULT_HERO = '/images/prueba/hero.png';

const Hero = ({ 
  backgroundImage,
}) => {
  const { data } = useGetHeroImageQuery();
  const heroImage = backgroundImage || data?.data?.url || DEFAULT_HERO;
  // Solo estados para el pan en mobile
  const [isPanning, setIsPanning] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 50, y: 50 });
  const [isMobile, setIsMobile] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startPan = useRef({ x: 50, y: 50 });

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch handlers
  const handleTouchStart = (e) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
    startPan.current = { ...panPosition };
  };

  const handleTouchMove = (e) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - startPos.current.x);
    const deltaY = Math.abs(touch.clientY - startPos.current.y);

    // Solo activar pan si el movimiento es más horizontal que vertical
    if (deltaX > deltaY && deltaX > 10) {
      if (!isPanning) setIsPanning(true);
      
      const panDeltaX = (touch.clientX - startPos.current.x) / window.innerWidth * 30;
      const panDeltaY = (touch.clientY - startPos.current.y) / window.innerHeight * 30;

      setPanPosition({
        x: Math.max(20, Math.min(80, startPan.current.x - panDeltaX)),
        y: Math.max(20, Math.min(80, startPan.current.y - panDeltaY))
      });
      e.preventDefault(); // Solo prevenir si estamos haciendo pan
    }
  };

  const handleTouchEnd = () => setIsPanning(false);

  // Event listeners solo para touch
  useEffect(() => {
    if (isMobile) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isPanning, isMobile, panPosition]);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* ✅ PANTALLAS GRANDES: Imagen con tag img para ocupar toda la pantalla */}
      {!isMobile && (
        <>
          {/* Background de fallback */}
          <div className="absolute inset-0 bg-gray-900 -z-10" />
          
          {/* Imagen principal que SIEMPRE llena la pantalla */}
          <img
            src={heroImage}
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover object-center z-0"
            onLoad={() => console.log('✅ Imagen cargada!')}
            onError={() => console.log('❌ Error cargando imagen')}
          />
        </>
      )}

      {/* ✅ MOBILE: Background image con pan */}
      {isMobile && (
        <>
          <div 
            className="absolute inset-0 z-0 bg-gray-900"
            style={{
              backgroundImage: `url(${heroImage})`,
              backgroundSize: 'cover',
              backgroundPosition: `${panPosition.x}% ${panPosition.y}%`,
              backgroundRepeat: 'no-repeat',
              transition: isPanning ? 'none' : 'background-position 0.3s ease-out'
            }}
            onTouchStart={handleTouchStart}
          />
          
          {/* Indicador de deslizamiento - Solo móvil */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none animate-pulse">
            <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-full bg-black/40 backdrop-blur-sm border border-white/30">
              {/* Iconos de flechas horizontales con animación */}
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-white/80 animate-bounce" style={{ animationDirection: 'alternate', animationDuration: '1.5s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <svg className="w-4 h-4 text-white/80 animate-bounce" style={{ animationDirection: 'alternate-reverse', animationDuration: '1.5s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <span className="text-white/90 text-xs font-light tracking-wider">Desliza para explorar</span>
            </div>
          </div>
        </>
      )}

      {/* ✅ Scroll Indicator - Solo en pantallas medianas y grandes */}
      <button 
        onClick={() => scrollToSection('#slogan-section')}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer hover:scale-110 transition-all duration-300 group hidden md:block"
        aria-label="Desplazarse hacia abajo"
      >
        {/* Contenedor con fondo para mejor visibilidad */}
        <div className="flex flex-col items-center px-4 py-3 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-black/50 transition-all duration-300">
          <div className="w-px h-12 bg-white/70 mb-2"></div>
          <svg 
            className="w-6 h-6 text-white animate-bounce group-hover:text-white transition-colors duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </div>
      </button>
    </section>
  );
};

export default Hero;