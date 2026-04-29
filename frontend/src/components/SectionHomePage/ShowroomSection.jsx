import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useGetCategoriesQuery } from '../../features/categories/categoriesApi';
import { scrollToSection } from '../../utils/simpleScroll';
import { useTranslation } from '../../hooks/useTranslation';
import { useHomeLoading } from '../../contexts/HomeLoadingContext';

const ShowroomSection = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetCategoriesQuery({ 
    includeSubcategories: false, 
    activeOnly: true,
    limit: 10
  });
  
  // Acceder al contexto de carga
  const { setSectionLoaded } = useHomeLoading();
  
  // Usar ref para rastrear si ya marcamos como cargado
  const hasMarkedLoaded = useRef(false);
  
  const categories = data?.data?.filter(cat => cat.featuredImage) || [];

  // Actualizar el estado de carga en el contexto
  useEffect(() => {
    // Importante: Solo establecer a cargado (loaded=true) cuando tenemos datos Y no lo hayamos hecho antes
    if (!isLoading && categories.length > 0 && !hasMarkedLoaded.current) {
      console.log('ShowroomSection - Marcando como cargado');
      setSectionLoaded('showroom', true); // true = cargado (ya no está cargando)
      hasMarkedLoaded.current = true; // Marcar que ya lo hicimos
    }
  }, [isLoading, categories.length, setSectionLoaded]);

  // Ajustar slide inicial basado en la cantidad de categorías disponibles
  useEffect(() => {
    if (categories.length > 0) {
      // Si solo hay una categoría o menos de 3, comenzar desde el índice 0
      // Si hay 2 o más, comenzar desde el índice 1 (segunda imagen)
      setCurrentSlide(categories.length >= 3 ? 1 : 0);
    }
  }, [categories.length]);

  const [currentSlide, setCurrentSlide] = useState(1); // Comenzar desde la segunda imagen (índice 1)
  const [isMobile, setIsMobile] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-play del slider
  useEffect(() => {
    if (!isAutoPlaying || categories.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % categories.length);
    }, 4000); // Un poco más rápido que proyectos

    return () => clearInterval(interval);
  }, [isAutoPlaying, categories.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % categories.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + categories.length) % categories.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="text-center py-12 text-gray-400">Cargando Salón de Ventas...</div>
      </section>
    );
  }

  if (error || categories.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="text-center py-12 text-gray-400">
          {error ? 'Error al cargar categorías' : 'No hay categorías con imágenes disponibles'}
        </div>
      </section>
    );
  }

  return (
    <section id="showroom-section" className="py-16 bg-gray-50 relative">
      {/* Título de la sección */}
      <div className="max-w-6xl mx-auto px-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-light text-center text-gray-900 tracking-wide">
          {t('showroom.title')}
        </h2>
        <p className="text-center text-gray-600 mt-4 max-w-2xl mx-auto">
          {t('showroom.description')}
        </p>
      </div>

      {/* Slider de categorías */}
      <div className="relative overflow-hidden" style={{ 
        height: isMobile ? '400px' : '500px'
      }}>
        {/* Container principal */}
        <div className="relative h-full flex items-center">

          {/* Slides Container */}
          <div 
            className="flex transition-transform duration-1000 ease-out h-full"
            style={isMobile ? {
              // Móvil: Una imagen a la vez, centrada
              transform: `translateX(-${currentSlide * 100}%)`,
              width: `${categories.length * 100}%`,
              paddingLeft: '5%',
              paddingRight: '5%'
            } : {
              // Desktop: Slide central visible + partes de los adyacentes
              transform: `translateX(calc(50% - ${currentSlide * 70}% - 35%))`,
              width: `${categories.length * 70}%`,
              gap: '1.5rem'
            }}
          >
            {categories.map((category, index) => {
              const isActive = index === currentSlide;
              
              // Obtener la imagen usando la estructura correcta
              const imageUrl = category.featuredImage?.desktop?.url || 
                             category.featuredImage?.thumbnail?.url || 
                             category.featuredImage?.mobile?.url || null;
              
              // Solo usar Link, sin ningún handler extra que sobrescriba la navegación
              return (
                <div
                  key={category.id}
                  className={`relative flex-shrink-0 transition-all duration-1000 cursor-pointer group ${
                    isMobile 
                      ? 'opacity-100 scale-100 z-10' 
                      : isActive 
                        ? 'opacity-100 scale-100 z-20' 
                        : 'opacity-80 scale-95 z-10'
                  }`}
                  style={isMobile ? {
                    width: '90%',
                    height: '300px',
                    marginRight: '1rem'
                  } : {
                    width: '70%',
                    height: '400px',
                    marginRight: '1.5rem'
                  }}
                  onClick={() => {
                    window.location.href = `/showroom/${category.slug}`;
                  }}
                >
                  {/* Imagen principal con aspect ratio horizontal */}
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={category.name}
                      className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f5f5f5'/%3E%3Ctext x='400' y='180' text-anchor='middle' fill='%23999' font-size='24' font-family='Arial'%3E" + category.name + "%3C/text%3E%3Ctext x='400' y='220' text-anchor='middle' fill='%23666' font-size='16' font-family='Arial'%3ESin imagen%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-lg">
                      <span className="text-gray-500 text-lg">{category.name}</span>
                    </div>
                  )}
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent rounded-lg group-hover:from-black/60 transition-all duration-300" />
                  {/* Contenido del slide */}
                  <div className={`absolute bottom-0 left-0 right-0 text-white transition-all duration-700 ${
                    (isMobile || isActive) ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-1'
                  } p-6 rounded-b-lg`}>
                    <div className="max-w-md">
                      {/* Título de la categoría */}
                      <h3 className={`font-light mb-2 tracking-wide ${
                        isMobile ? 'text-xl' : 'text-2xl lg:text-3xl'
                      }`}>
                        {category.name}
                      </h3>
                      {/* Descripción */}
                      {category.description && (
                        <p className={`font-light opacity-90 mb-4 line-clamp-2 ${
                          isMobile ? 'text-sm' : 'text-base'
                        }`}>
                          {category.description}
                        </p>
                      )}
                      {/* Botón explorar */}
                      <div className={`inline-flex items-center text-white font-light uppercase tracking-wider hover:opacity-70 transition-all duration-300 group-hover:translate-x-1 ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>
                        {t('showroom.categoria')}
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {/* Indicador de categoría activa */}
                  {!isMobile && isActive && (
                    <div className="absolute top-4 left-4 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {t('showroom.destacados')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Controles de navegación */}
          <button
            onClick={prevSlide}
            className={`absolute top-1/2 transform -translate-y-1/2 z-30 bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white shadow-lg transition-all duration-300 ${
              isMobile ? 'left-4 p-2 rounded-full' : 'left-8 p-3 rounded-full'
            }`}
          >
            <ChevronLeftIcon className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} strokeWidth={2} />
          </button>

          <button
            onClick={nextSlide}
            className={`absolute top-1/2 transform -translate-y-1/2 z-30 bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white shadow-lg transition-all duration-300 ${
              isMobile ? 'right-4 p-2 rounded-full' : 'right-8 p-3 rounded-full'
            }`}
          >
            <ChevronRightIcon className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} strokeWidth={2} />
          </button>
        </div>

        {/* Indicadores inferiores */}
        <div className={`absolute left-1/2 transform -translate-x-1/2 z-30 flex ${
          isMobile ? 'bottom-6 space-x-2' : 'bottom-8 space-x-3'
        }`}>
          {categories.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? isMobile 
                    ? 'bg-orange-600 w-6' 
                    : 'bg-orange-600 w-8'
                  : isMobile
                    ? 'bg-gray-400 hover:bg-gray-600 w-3'
                    : 'bg-gray-400 hover:bg-gray-600 w-4'
              }`}
            />
          ))}
        </div>

        {/* Contador de categorías */}
        <div className={`absolute z-30 text-gray-700 font-medium bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full ${
          isMobile ? 'top-4 right-4 text-xs' : 'top-6 right-6 text-sm'
        }`}>
          {(currentSlide + 1).toString().padStart(2, '0')} / {categories.length.toString().padStart(2, '0')}
        </div>

        {/* Control de auto-play */}
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`absolute z-30 bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white transition-all duration-300 rounded-full shadow-md ${
            isMobile ? 'bottom-6 right-4 p-2' : 'bottom-8 right-6 p-2'
          }`}
          title={isAutoPlaying ? 'Pausar auto-play' : 'Activar auto-play'}
        >
          {isAutoPlaying ? (
            <svg className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
            </svg>
          ) : (
            <svg className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          )}
        </button>
      </div>

      {/* Llamada a la acción */}
      <div className="max-w-6xl mx-auto px-4 mt-12 text-center">
        <Link 
          to="/showroom"
          className="inline-flex items-center bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-all duration-300 font-medium"
        >
          {t('showroom.verTodo')}
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* Flecha de navegación */}
      <button 
        onClick={() => scrollToSection('#ediciones-section')}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 cursor-pointer hover:scale-110 transition-transform duration-300"
        aria-label="Ver ediciones"
      >
        <div className="w-px h-6 bg-gray-300 mx-auto mb-2"></div>
        <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors duration-300 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    </section>
  );
};

export default ShowroomSection;
