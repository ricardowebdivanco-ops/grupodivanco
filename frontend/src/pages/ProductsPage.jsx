import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts, useProductFilters } from '../features/products/useProducts';
import ProductGrid from '../components/ProductGrid';
import ProductFilters from '../components/ProductFilters';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Inicializar filtros desde URL
  const initialFilters = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '12'),
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || null,
    subcategoryId: searchParams.get('subcategoryId') || null,
    featured: searchParams.get('featured') === 'true' ? true : undefined,
    isNew: searchParams.get('isNew') === 'true' ? true : undefined,
    brand: searchParams.get('brand') || '',
    sortBy: searchParams.get('sortBy') || 'order',
    sortOrder: searchParams.get('sortOrder') || 'ASC'
  };

  const {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    setPage
  } = useProductFilters(initialFilters);

  const {
    products,
    totalProducts,
    totalPages,
    currentPage,
    isLoading,
    error,
    refetch
  } = useProducts(filters);

  // Sincronizar filtros con URL
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, value.toString());
      }
    });

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  const handlePageChange = (page) => {
    setPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Nuestros Productos
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre nuestra amplia gama de productos de alta calidad para tu hogar y oficina.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <ProductFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            isLoading={isLoading}
          />
        </div>

        {/* Results Summary */}
        {!isLoading && !error && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600">
              {totalProducts > 0 ? (
                <>
                  Mostrando {((currentPage - 1) * filters.limit) + 1} - {Math.min(currentPage * filters.limit, totalProducts)} de {totalProducts} productos
                  {filters.search && (
                    <span className="ml-2">
                      para "<span className="font-medium">{filters.search}</span>"
                    </span>
                  )}
                </>
              ) : (
                'No se encontraron productos'
              )}
            </div>

            {totalProducts > 0 && (
              <div className="flex items-center gap-4">
                <button
                  onClick={refetch}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Actualizar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Products Grid */}
        <ProductGrid
          products={products}
          isLoading={isLoading}
          error={error}
          showCategory={true}
          showSubcategory={true}
          showFilters={true}
          filters={filters}
          onFilterChange={updateFilters}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          showPagination={true}
          emptyTitle="No se encontraron productos"
          emptyDescription="Intenta ajustar los filtros o buscar términos diferentes."
        />
      </div>

     
    </div>
  );
};

export default ProductsPage;
