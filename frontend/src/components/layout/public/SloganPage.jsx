import React from 'react';
import { scrollToSection } from '../../../utils/simpleScroll';
import { useTranslation } from '../../../hooks/useTranslation';


function SloganPage() {
 const { t } = useTranslation();

 return (
  <section id="slogan-section" className="relative min-h-screen bg-white flex items-center justify-center overflow-hidden py-8 pb-30">
    {/* Container principal */}
    <div className="max-w-4xl mx-auto mt-10 px-4 sm:px-6 lg:px-8 text-center">

      {/* Slogan principal */}
      <div className="space-y-6 md:space-y-8">
        

        {/* Logo grande y centrado más abajo */}
        <div className="flex flex-col items-center justify-center mt-20 mb-16">
          <img
            src="/images/prueba/logo.svg"
            alt="DIVANCO Logo"
            className="w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 opacity-90 hover:opacity-100 transition-opacity duration-500 mb-8"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {/* Textos debajo del logo, uno debajo del otro */}
          <div className="flex flex-col items-center justify-center gap-4 md:gap-6">
            <p className="text-xl md:text-2xl lg:text-3xl font-light text-gray-700 tracking-widest uppercase">
              {t('sloganPage.design')}
            </p>
            <p className="text-xl md:text-2xl lg:text-3xl font-light text-gray-700 tracking-widest uppercase">
              {t('sloganPage.vanguard')}
            </p>
            <p className="text-xl md:text-2xl lg:text-3xl font-light text-gray-700 tracking-widest uppercase">
              {t('sloganPage.construction')}
            </p>
          </div>
        </div>

        {/* ✅ OPCIONAL: Agregar descripción con el nuevo estilo */}
        <div className="mt-12 md:mt-16">
         
        </div>
      </div>

      {/* Elementos decorativos sutiles */}
      <div className="hidden md:block absolute top-20 left-10 w-px h-20 bg-gradient-to-b from-transparent via-gray-200 to-transparent opacity-50"></div>
      <div className="hidden md:block absolute bottom-20 right-10 w-px h-20 bg-gradient-to-b from-transparent via-gray-200 to-transparent opacity-50"></div>
      
      {/* Círculos decorativos */}
      <div className="hidden lg:block absolute top-40 right-20 w-1 h-1 bg-gray-300 rounded-full opacity-60"></div>
      <div className="hidden lg:block absolute bottom-40 left-20 w-1 h-1 bg-gray-300 rounded-full opacity-60"></div>
    </div>

    {/* Scroll indicator sutil - Solo en pantallas md+, bien abajo y centrada */}
    <button 
      onClick={() => scrollToSection('#projects-section')}
      className="absolute left-1/2 bottom-6 transform -translate-x-1/2 cursor-pointer hover:scale-110 transition-transform duration-300 hidden md:block"
      aria-label={t('sloganPage.seeProjects')}
    >
      <div className="w-px h-8 bg-gray-300 mx-auto mb-2"></div>
      <svg className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors duration-300 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </button>
  </section>
);
}

export default SloganPage;