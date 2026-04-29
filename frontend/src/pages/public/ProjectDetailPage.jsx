import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useGetProjectBySlugQuery } from '../../features/projects/projectsApi';
import RelatedProjects from '../../components/ui/RelatedProjects';
import ProjectNavigation from '../../components/ui/ProjectNavigation';
import ImageLightbox from '../../components/ui/ImageLightbox';
import { ScrollProgress, ProjectBreadcrumbs, FloatingActions } from '../../components/ui/ProjectExtras';
import ProjectSEO from '../../components/ui/ProjectSEO';
import { useTranslation } from '../../hooks';

// Imagen/Video principal con descripción corta
const ProjectHero = ({ project, mainImage, t }) => {
  const isVideo = mainImage?.type === 'video';
  
  return (
    <div className="relative h-[60vh] w-full overflow-hidden bg-black">
      {mainImage ? (
        <>
          {isVideo ? (
            <video
              src={mainImage.urls?.main || mainImage.urls?.original || mainImage.url}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              onError={(e) => {
                console.error('Error cargando video en hero:', e);
                console.log('URL del video:', mainImage.urls?.main || mainImage.urls?.original || mainImage.url);
              }}
            >
              Tu navegador no soporta la reproducción de video.
            </video>
          ) : (
            <img
              src={mainImage.urls?.desktop || mainImage.urls?.mobile || mainImage.url}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          )}
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
          <span className="text-gray-400 text-xl font-alt">{t('projectDetail.sinImagen')}</span>
        </div>
      )}
    </div>
  );
};

// ✅ NUEVO: Información del proyecto en dos columnas
const ProjectInfo = ({ project, t }) => (
   <div className="max-w-7xl mx-auto mt-8 relative z-10 px-4 sm:px-6 md:px-8">
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* COLUMNA IZQUIERDA: Descripción scrolleable (2/3 del ancho) */}
        <div className="lg:col-span-2 p-4 sm:p-6 lg:p-12">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light text-gray-600 mb-4 leading-tight">
                {project.title}
                {project.architect && (
                  <span className="block text-sm font-normal text-gray-500 mt-3 tracking-wider uppercase">
                    — POR {project.architect}
                  </span>
                )}
                {!project.architect && project.projectType && (
                  <span className="block text-sm font-normal text-gray-500 mt-3 tracking-wider uppercase">
                    — {Array.isArray(project.projectType) 
                        ? project.projectType.join(' • ') 
                        : project.projectType}
                  </span>
                )}
              </h1>
            </div>

            {project.description && (
              <div className="relative">
                <div 
                  className="text-gray-700 font-light leading-relaxed text-base md:text-lg md:max-h-48 md:overflow-y-auto md:pr-4 md:custom-scrollbar relative"
                  style={{ lineHeight: '1.7' }}
                >
                  {project.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
                <div className="hidden md:block absolute bottom-0 left-0 right-4 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                <div className="hidden md:flex items-center justify-center mt-3 text-gray-400">
                  <div className="flex items-center gap-2 text-xs font-light">
                    <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span className="tracking-wider uppercase">{t('projectDetail.deslizaContenido')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Metadatos y especificaciones */}
        <div className="bg-gray-50 p-4 sm:p-6 lg:p-12 border-t lg:border-t-0 lg:border-l border-gray-100">
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-medium text-gray-500 tracking-wider uppercase mb-6 border-b border-gray-200 pb-2">
                — {t('projectDetail.informacion')}
              </h3>
              <div className="space-y-5">
                {project.year && (
                  <div className="group">
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      {t('projectDetail.año')}
                    </dt>
                    <dd className="text-2xl font-light text-gray-900">
                      {project.year}
                    </dd>
                  </div>
                )}
                {project.location && (
                  <div className="group">
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      {t('projectDetail.ubicacion')}
                    </dt>
                    <dd className="text-lg font-light text-gray-900 leading-relaxed">
                      {project.location}
                    </dd>
                  </div>
                )}
                {project.client && (
                  <div className="group">
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      {t('projectDetail.cliente')}
                    </dt>
                    <dd className="text-lg font-light text-gray-900">
                      {project.client}
                    </dd>
                  </div>
                )}
                {project.projectType && (
                  <div className="group">
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      {t('projectDetail.etapa')}
                    </dt>
                    <dd className="text-lg font-light text-gray-900">
                      {Array.isArray(project.projectType) 
                        ? project.projectType.join(' • ') 
                        : project.projectType}
                    </dd>
                  </div>
                )}
                {project.area && (
                  <div className="group">
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      {t('projectDetail.area')}
                    </dt>
                    <dd className="text-lg font-light text-gray-900">
                      {project.area}
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* ESPECIFICACIONES COMO TABLA CLAVE:VALOR */}
            {project.specifications && Object.keys(project.specifications).length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 tracking-wider uppercase mb-4 border-b border-gray-200 pb-2">
                  — {t('projectDetail.especificaciones') || 'Especificaciones'}
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <tbody>
                      {Object.entries(project.specifications).map(([key, value], idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2 pr-4 font-medium text-gray-600 whitespace-nowrap capitalize">{key.replace(/_/g, ' ')}</td>
                          <td className="py-2 text-gray-900 font-light">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAGS */}
            {project.tags && project.tags.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 tracking-wider uppercase mb-4 border-b border-gray-200 pb-2">
                  — Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full capitalize"
                    >
                      {tag.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(project.startDate || project.endDate) && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 tracking-wider uppercase mb-4 border-b border-gray-200 pb-2">
                  — {t('projectDetail.cronologia')}
                </h4>
                <div className="space-y-4">
                  {project.startDate && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        {t('projectDetail.inicio')}
                      </dt>
                      <dd className="text-base font-light text-gray-900">
                        {new Date(project.startDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </dd>
                    </div>
                  )}
                  {project.endDate && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        {t('projectDetail.finalizacion')}
                      </dt>
                      <dd className="text-base font-light text-gray-900">
                        {new Date(project.endDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            )}

            {project.kuulaUrl && (
              <div className="pt-6 border-t border-gray-200">
                <a
                  href={project.kuulaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-light text-white bg-naranjaDivanco hover:bg-orange-600 rounded-none transition-all duration-200 shadow-sm hover:shadow-md tracking-wider uppercase"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H9C10.1046 20 11 19.1046 11 18V6C11 4.89543 10.1046 4 9 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 4H15C13.8954 4 13 4.89543 13 6V18C13 19.1046 13.8954 20 15 20H19C20.1046 20 21 19.1046 21 18V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 12C4 11.4477 4.44772 11 5 11H9C9.55228 11 10 11.4477 10 12C10 12.5523 9.55228 13 9 13H5C4.44772 13 4 12.5523 4 12Z" fill="currentColor"/>
                    <path d="M14 12C14 11.4477 14.4477 11 15 11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H15C14.4477 13 14 12.5523 14 12Z" fill="currentColor"/>
                    <path d="M7 8V8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 8V8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('projectDetail.verTourVirtual')}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    <div className="flex flex-col items-center mt-8 md:mt-12 lg:mt-16 mb-4 md:mb-8 px-4">
      <div className="text-center space-y-4">
        <h3 className="text-xs font-medium text-gray-500 tracking-wider uppercase">
          — {t('projectDetail.galeria')}
        </h3>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-naranjaDivanco rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-naranjaDivanco rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-naranjaDivanco rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
        <svg 
          className="w-6 h-6 text-naranjaDivanco animate-bounce mx-auto" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  </div>
);

const MEDIA_TYPES = [
  { key: 'render', label: 'Renders', isVideo: false },
  { key: 'obra_finalizada', label: 'Obra Finalizada', isVideo: false },
  { key: 'obra_proceso', label: 'Obra en Proceso', isVideo: false },
  { key: 'plano', label: 'Planos', isVideo: false },
  { key: 'image', label: 'Imágenes', isVideo: false },
  { key: 'video', label: 'Videos', isVideo: true },
];

// Galería de imágenes agrupada y sincronizada con el lightbox
const ProjectGallery = ({ mediaFiles, galleryImages, onImageClick }) => {
  if (!mediaFiles || mediaFiles.length === 0) return null;

  // 🔍 DEBUG: Ver archivos media en página pública
  console.log('🎬 ProjectGallery Debug:', {
    totalMediaFiles: mediaFiles.length,
    mediaTypes: mediaFiles.map(m => ({ id: m.id, type: m.type, filename: m.filename || 'no-filename' })),
    videosFound: mediaFiles.filter(f => f.type === 'video'),
    videoCount: mediaFiles.filter(f => f.type === 'video').length
  });

  return (
    <div className="bg-gray-50 py-12 md:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 space-y-12">
        {MEDIA_TYPES.map(({ key, label, isVideo }) => {
          const mediaItems = mediaFiles.filter(file =>
            file.type === key && file.urls
          );
          if (mediaItems.length === 0) return null;
          return (
            <div key={key}>
              {/* ✅ Título de sección con estilo mejorado */}
              <h3 className="text-lg font-light text-gray-500 mb-6 tracking-wider uppercase">
                — {label}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {mediaItems.map((mediaItem) => (
                  <div
                    key={mediaItem.id}
                    className={`group overflow-hidden bg-white rounded-none shadow-sm hover:shadow-xl transition-all duration-300 ${
                      isVideo ? '' : 'cursor-pointer'
                    }`}
                    onClick={isVideo ? undefined : () => onImageClick(galleryImages.findIndex(f => f.id === mediaItem.id))}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      {isVideo ? (
                        <video
                          src={mediaItem.urls?.main || mediaItem.urls?.original || mediaItem.url}
                          className="w-full h-full object-cover"
                          controls
                          preload="metadata"
                          onError={(e) => {
                            console.error('Error cargando video:', e);
                            console.log('URL del video:', mediaItem.urls?.main || mediaItem.urls?.original || mediaItem.url);
                            console.log('URLs disponibles:', mediaItem.urls);
                          }}
                        >
                          Tu navegador no soporta la reproducción de video.
                        </video>
                      ) : (
                        <img
                          src={mediaItem.urls?.desktop || mediaItem.urls?.mobile || mediaItem.urls?.thumbnail || mediaItem.url}
                          alt={mediaItem.description || `Media`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    {mediaItem.description && (
                      <div className="p-3 text-xs font-light text-gray-500 tracking-wider">{mediaItem.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Tour virtual - Ahora con enlace directo a Kuula
const VirtualTour = ({ kuulaUrl, t }) => {
  if (!kuulaUrl) return null;
  
  return (
    <div id="virtual-tour" className="bg-gray-900 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-light mb-4 text-white">
            {t('projectDetail.tourVirtual')}
            <span className="block text-sm font-normal text-gray-300 mt-3 tracking-wider uppercase">
              — {t('projectDetail.tourVirtualSubtitle')}
            </span>
          </h2>
          <p className="text-gray-300 mt-4 max-w-2xl mx-auto font-light">
            {t('projectDetail.verMejorExperiencia')}
          </p>
        </div>
        
        {/* Botón para abrir Kuula en nueva ventana */}
        <div className="flex justify-center">
          <a
            href={kuulaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white px-10 py-5 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {/* Efecto de partículas en el fondo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white/20 absolute animate-ping" style={{ left: '20%', top: '30%' }}></div>
              <div className="w-2 h-2 rounded-full bg-white/20 absolute animate-ping" style={{ left: '70%', top: '60%', animationDelay: '0.5s' }}></div>
              <div className="w-1 h-1 rounded-full bg-white/20 absolute animate-ping" style={{ left: '40%', top: '80%', animationDelay: '1s' }}></div>
            </div>
            
            <div className="relative flex items-center space-x-3">
              {/* Icono de VR/Oculus más descriptivo */}
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12.5V13.5C3 16.5376 5.46243 19 8.5 19C10.7504 19 12.7127 17.6457 13.5 15.6914C14.2873 17.6457 16.2496 19 18.5 19C21.5376 19 24 16.5376 24 13.5V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M13.5 15.5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M3 12.5V7.5C3 6.67157 3.67157 6 4.5 6H7.5C8.32843 6 9 6.67157 9 7.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M24 12.5V7.5C24 6.67157 23.3284 6 22.5 6H19.5C18.6716 6 18 6.67157 18 7.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M1.99219 13.5H6.00019C7.65705 13.5 9.00019 12.1569 9.00019 10.5V9.50001C9.00019 7.84315 10.3433 6.50001 12.0002 6.50001H15.0002C16.657 6.50001 18.0002 7.84315 18.0002 9.50001V10.5C18.0002 12.1569 19.3433 13.5 21.0002 13.5H25.0082" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="text-lg font-medium tracking-wide">{t('projectDetail.abrirTourVirtual')}</span>
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </a>
        </div>
        
        {/* Vista previa */}
        <a 
          href={kuulaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 relative aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10 group cursor-pointer block"
        >
          {/* Capa de overlay con efecto hover */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-all duration-300">
            <div className="text-white text-center transform group-hover:scale-110 transition-all duration-300">
              {/* Icono de VR/Oculus para la vista previa */}
              <svg className="w-20 h-20 mx-auto mb-4 text-white/90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 8C1 6.89543 1.89543 6 3 6H21C22.1046 6 23 6.89543 23 8V16C23 17.1046 22.1046 18 21 18H3C1.89543 18 1 17.1046 1 16V8Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 6V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M16 6V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="4.5" cy="12" r="0.5" fill="currentColor"/>
                <circle cx="12" cy="12" r="0.5" fill="currentColor"/>
                <circle cx="19.5" cy="12" r="0.5" fill="currentColor"/>
                <path d="M8 10.5C8 9.67157 8.67157 9 9.5 9H14.5C15.3284 9 16 9.67157 16 10.5V13.5C16 14.3284 15.3284 15 14.5 15H9.5C8.67157 15 8 14.3284 8 13.5V10.5Z" fill="currentColor" fillOpacity="0.2"/>
              </svg>
              <p className="text-lg font-light tracking-wider">{t('projectDetail.clickParaAbrir')}</p>
            </div>
          </div>
          
          {/* Imagen de fondo (screenshot del tour) */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-white space-y-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-orange-500" viewBox="0 0 24 24" fill="none">
                <path d="M21 7.5V6.375C21 5.61561 20.3284 5 19.5 5H4.5C3.67157 5 3 5.61561 3 6.375V17.625C3 18.3844 3.67157 19 4.5 19H19.5C20.3284 19 21 18.3844 21 17.625V16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M11.9995 16C13.9995 16 15.9995 13.5 15.9995 12C15.9995 10.5 13.9995 8 11.9995 8C9.99951 8 7.99951 10.5 7.99951 12C7.99951 13.5 9.99951 16 11.9995 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="font-light tracking-wider uppercase text-sm text-gray-300">
                {t('projectDetail.tourvirtual360')}
              </p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};

const ProjectDetailPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { data: projectResponse, error, isLoading } = useGetProjectBySlugQuery(slug);
  const project = projectResponse?.data;
  const [mainImage, setMainImage] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Array plano de imágenes para lightbox (solo imágenes, no videos)
  const galleryImages = useMemo(() =>
    project?.media?.filter(file => file.urls && file.type !== 'video') || [],
    [project]
  );

  // Seleccionar imagen/video principal
  useEffect(() => {
    if (project?.media) {
      // ✅ Incluir videos además de imágenes y renders
      const mediaItems = project.media.filter(file => 
        file.type === 'image' || file.type === 'render' || file.type === 'video'
      );
      const featured = mediaItems.find(item => item.isMain);
      const selectedMedia = featured || mediaItems[0] || null;
      setMainImage(selectedMedia);
    }
  }, [project]);

  // Manejar clicks en galería
  const handleImageClick = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => setLightboxOpen(false);
  const handleNextImage = (index) => setLightboxIndex(index);
  const handlePrevImage = (index) => setLightboxIndex(index);

  const handleShareClick = () => {
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  useEffect(() => {
    if (project) {
      document.title = `${project.title} | Divanco`;
    }
    return () => {
      document.title = 'Divanco';
    };
  }, [project]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-naranjaDivanco mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-naranjaDivanco/20 mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600 font-alt font-medium">{t('projectDetail.cargandoProyecto')}</p>
            <div className="flex space-x-1 justify-center">
              <div className="w-2 h-2 bg-naranjaDivanco rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-naranjaDivanco rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-naranjaDivanco rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <Navigate to="/404" replace />;
  if (!project) return <Navigate to="/proyectos" replace />;

  return (
    <div className="min-h-screen bg-white">
      {/* SEO Meta Tags */}
      <ProjectSEO 
        project={project} 
        mainImage={mainImage} 
        currentUrl={window.location.href} 
      />
      {/* Scroll Progress */}
      <ScrollProgress />
      {/* Breadcrumbs */}
      <ProjectBreadcrumbs project={project} />
      {/* Hero Section */}
      <ProjectHero project={project} mainImage={mainImage} t={t} />
      {/* ✅ NUEVA: Información del proyecto en dos columnas */}
      <ProjectInfo project={project} t={t} />
      {/* Galería agrupada */}
      <ProjectGallery mediaFiles={project.media} galleryImages={galleryImages} onImageClick={handleImageClick} />
      {/* Virtual Tour */}
      <VirtualTour kuulaUrl={project.kuulaUrl} t={t} />
      {/* Related Projects */}
      <RelatedProjects currentProject={project} />
      {/* Navigation */}
      <ProjectNavigation currentProject={project} />
      {/* Floating Actions */}
      <FloatingActions project={project} onShareClick={handleShareClick} />
      {/* Share Success Notification */}
      {shareSuccess && (
        <div className="fixed bottom-20 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in-up border border-green-400">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-alt font-medium">{t('projectDetail.enlaceCopiado')}</span>
          </div>
        </div>
      )}
      {/* Image Lightbox */}
      <ImageLightbox
        images={galleryImages}
        isOpen={lightboxOpen}
        currentIndex={lightboxIndex}
        onClose={handleCloseLightbox}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
      />
      
      {/* ✅ Custom scrollbar styles */}
<style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 3px;
          transition: background 0.2s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        
        /* ✅ Animación suave para el contenido de scroll */
        .custom-scrollbar {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default ProjectDetailPage;