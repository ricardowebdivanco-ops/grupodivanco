import React from 'react';
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const ExistingMediaManager = ({ 
  media = [], 
  onDelete, 
  onToggleSlider,
  isDeleting = false 
}) => {
  // Función para detectar si un archivo es video
  const isVideoFile = (item) => {
    const videoExtensions = ['mp4', 'mov', 'avi', 'webm', 'ogg'];
    const fileExtension = item.filename?.split('.').pop()?.toLowerCase();
    return item.type === 'video' || videoExtensions.includes(fileExtension);
  };

  // 🔍 DEBUG: Ver qué archivos llegan y cuáles son videos
  console.log('🎥 ExistingMediaManager Debug:', {
    totalMedia: media.length,
    mediaTypes: media.map(m => ({ id: m.id, type: m.type, filename: m.filename })),
    videosDetected: media.filter(m => isVideoFile(m)),
    videoCount: media.filter(m => isVideoFile(m)).length
  });

  if (!media || media.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay archivos multimedia en este proyecto aún
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Archivos Multimedia ({media.length})
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {media.map((item) => (
          <div 
            key={item.id} 
            className="relative group border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Contenido multimedia */}
            <div className="aspect-square">
              {isVideoFile(item) ? (
                <video
                  src={item.urls?.main || item.urls?.original || item.url}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                  onError={(e) => {
                    console.error('Error cargando video:', e);
                    console.log('URL del video:', item.urls?.main || item.urls?.original || item.url);
                    console.log('URLs disponibles:', item.urls);
                  }}
                >
                  Tu navegador no soporta la reproducción de video.
                </video>
              ) : (
                <img
                  src={item.urls?.thumbnail || item.urls?.mobile || item.url}
                  alt={item.alt || item.title || 'Media'}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Overlay con acciones */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2">
              
              {/* Botón de marcar como slider */}
              <button
                onClick={() => onToggleSlider(item.id)}
                className={`opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full ${
                  item.isSliderImage 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-yellow-100'
                }`}
                title={item.isSliderImage ? 'Archivo del slider' : 'Marcar como archivo del slider'}
                disabled={isDeleting}
              >
                {item.isSliderImage ? (
                  <StarIconSolid className="w-5 h-5" />
                ) : (
                  <StarIcon className="w-5 h-5" />
                )}
              </button>

              {/* Botón de eliminar */}
              <button
                onClick={() => onDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                title={`Eliminar ${isVideoFile(item) ? 'video' : 'imagen'}`}
                disabled={isDeleting}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Badge de tipo */}
            <div className="absolute top-2 left-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-md bg-black bg-opacity-60 text-white ${
                isVideoFile(item) ? 'bg-blue-600' : 'bg-black bg-opacity-60'
              }`}>
                {isVideoFile(item) ? 'video' : (item.type || 'imagen')}
              </span>
            </div>

            {/* Badge de slider */}
            {item.isSliderImage && (
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 text-xs font-medium rounded-md bg-yellow-500 text-white flex items-center gap-1">
                  <StarIconSolid className="w-3 h-3" />
                  Slider
                </span>
              </div>
            )}

            {/* Información del archivo */}
            <div className="p-2 bg-gray-50 border-t">
              <p className="text-xs text-gray-600 truncate">
                {item.title || item.filename || 'Sin título'}
              </p>
              {item.order !== undefined && (
                <p className="text-xs text-gray-400">
                  Orden: {item.order}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExistingMediaManager;
