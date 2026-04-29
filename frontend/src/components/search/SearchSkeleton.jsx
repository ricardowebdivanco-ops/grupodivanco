import React from 'react';

const SearchSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Skeleton para estadísticas */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-4">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
      </div>

      {/* Skeleton para resultados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Imagen skeleton */}
            <div className="h-48 bg-gray-200 animate-pulse"></div>
            
            <div className="p-4">
              {/* Header con tipo */}
              <div className="flex items-center justify-between mb-2">
                <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>

              {/* Título */}
              <div className="space-y-2 mb-2">
                <div className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>

              {/* Descripción */}
              <div className="space-y-2 mb-3">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>

              {/* Tags */}
              <div className="flex gap-1 mb-3">
                <div className="h-6 bg-gray-200 rounded-full w-12 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded-full w-14 animate-pulse"></div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton para paginación */}
      <div className="flex justify-center">
        <div className="flex gap-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchSkeleton;
