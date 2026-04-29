import React, { createContext, useContext, useState } from 'react';

// Crear el contexto
const HomeLoadingContext = createContext();

// Proveedor del contexto
export const HomeLoadingProvider = ({ children }) => {
  // Estados de carga para cada sección
  const [loadingStates, setLoadingStates] = useState({
    projects: true,  // true significa "está cargando"
    blog: true,
    showroom: true,
    ediciones: true
  });

  // Función para actualizar el estado de carga de una sección
  // loaded = true significa "carga completada"
  // loaded = false significa "está cargando"
  const setSectionLoaded = (section, loaded) => {
    console.log(`Setting section ${section} loaded:`, loaded);
    
    // Forzamos el valor directamente para garantizar el cambio
    if (loaded) {
      setLoadingStates(prev => {
        // Si ya está marcado como cargado (false), no hacer nada
        if (prev[section] === false) return prev;
        
        const newState = { ...prev, [section]: false };
        console.log('New loading states:', newState);
        return newState;
      });
    }
  };

  // Valores a compartir
  const value = {
    loadingStates,
    setSectionLoaded,
    isAnyLoading: Object.values(loadingStates).some(state => state)
  };

  return (
    <HomeLoadingContext.Provider value={value}>
      {children}
    </HomeLoadingContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useHomeLoading = () => {
  const context = useContext(HomeLoadingContext);
  if (!context) {
    throw new Error('useHomeLoading debe ser usado dentro de un HomeLoadingProvider');
  }
  return context;
};
