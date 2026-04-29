import { useState } from 'react';
import ProductCard from './ProductCard';
import Pagination from './Pagination';

const ProductGrid = ({
  products = [],
  isLoading = false,
  error = null,
  showCategory = true,
  showSubcategory = true,
  className = '',
  gridClassName = '',
  cardClassName = '',
  // Pagination props
  currentPage = 1,
  totalPages = 1,
  onPageChange = null,
  showPagination = true,
  // Filter controls
  showFilters = false,
  filters = {},
  onFilterChange = null,
  // Empty state
  emptyTitle = 'No se encontraron productos',
  emptyDescription = 'Intenta ajustar los filtros o buscar términos diferentes.',
  emptyImage = null
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${gridClassName}`}>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="aspect-[4/3] bg-gray-200 animate-pulse"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error state
  const ErrorState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 text-red-500">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Error al cargar productos
      </h3>
      <p className="text-gray-600 mb-4">
        {error?.message || 'Ha ocurrido un error inesperado'}
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        Reintentar
      </button>
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div className="text-center py-12">
      {emptyImage ? (
        <img src={emptyImage} alt="No hay productos" className="w-32 h-32 mx-auto mb-4 opacity-50" />
      ) : (
        <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
            />
          </svg>
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {emptyTitle}
      </h3>
      <p className="text-gray-600 max-w-md mx-auto">
        {emptyDescription}
      </p>
    </div>
  );

  // Filter controls
  const FilterControls = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Vista:</span>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-sm ${
                viewMode === 'grid'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm ${
                viewMode === 'list'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                onFilterChange?.({ sortBy, sortOrder });
              }}
              className="text-sm border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="order-ASC">Orden personalizado</option>
              <option value="name-ASC">Nombre (A-Z)</option>
              <option value="name-DESC">Nombre (Z-A)</option>
              <option value="price-ASC">Precio (menor a mayor)</option>
              <option value="price-DESC">Precio (mayor a menor)</option>
              <option value="createdAt-DESC">Más recientes</option>
              <option value="createdAt-ASC">Más antiguos</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {products.length} productos
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className={className}>
        {showFilters && <FilterControls />}
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {showFilters && <FilterControls />}
        <ErrorState />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className={className}>
        {showFilters && <FilterControls />}
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={className}>
      {showFilters && <FilterControls />}
      
      {/* Products Grid */}
      <div className={`
        ${viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
          : 'space-y-4'
        } ${gridClassName}
      `}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showCategory={showCategory}
            showSubcategory={showSubcategory}
            className={`${cardClassName} ${viewMode === 'list' ? 'flex' : ''}`}
            imageClassName={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}
          />
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && onPageChange && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
