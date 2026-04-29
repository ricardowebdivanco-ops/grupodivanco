import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { translationService } from '../services/translationService';

export const useTranslation = () => {
  const { t, i18n } = useI18nextTranslation();
  const [dynamicTranslations, setDynamicTranslations] = useState({});

  // Función para traducir contenido estático
  const translate = (key, options = {}) => {
    return t(key, options);
  };

  // Función para traducir contenido dinámico
  const translateDynamic = async (content, contentType = 'general') => {
    if (!content) return '';
    
    const currentLang = i18n.language;
    const cacheKey = `${content}-${currentLang}`;
    
    // Si ya está en cache, devolverlo
    if (dynamicTranslations[cacheKey]) {
      return dynamicTranslations[cacheKey];
    }

    // Si es español, devolver original
    if (currentLang === 'es') {
      return content;
    }

    try {
      const translation = await translationService.translateDynamicContent(
        content, 
        currentLang, 
        contentType
      );
      
      // Actualizar cache local
      setDynamicTranslations(prev => ({
        ...prev,
        [cacheKey]: translation
      }));
      
      return translation;
    } catch (error) {
      console.error('Dynamic translation error:', error);
      return content;
    }
  };

  // Cambiar idioma
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    // Limpiar cache de traducciones dinámicas al cambiar idioma
    setDynamicTranslations({});
  };

  return {
    t: translate,
    translateDynamic,
    currentLanguage: i18n.language,
    changeLanguage,
    isLoading: false
  };
};
