import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const LanguageSwitcher = ({ className = '' }) => {
  const { currentLanguage, changeLanguage } = useTranslation();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* ES */}
      <button
        onClick={() => changeLanguage('es')}
        className={`text-sm font-medium tracking-wider transition-all duration-200 hover:scale-105 ${
          currentLanguage === 'es'
            ? 'text-naranjaDivanco font-semibold'
            : 'text-white/70 hover:text-white'
        }`}
      >
        ES
      </button>

      {/* Separador */}
      <span className="text-white/30 text-sm">|</span>

      {/* EN */}
      <button
        onClick={() => changeLanguage('en')}
        className={`text-sm font-medium tracking-wider transition-all duration-200 hover:scale-105 ${
          currentLanguage === 'en'
            ? 'text-naranjaDivanco font-semibold'
            : 'text-white/70 hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;