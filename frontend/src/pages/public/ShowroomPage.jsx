import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetCategoriesQuery } from '../../features/categories/categoriesApi';
import { useGetProductsQuery } from '../../features/products/productsApi';

const ShowroomPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState('ASC');
  const limit = 16;

  // Obtener categorías
  const { data: categoriesData, isLoading: loadingCategories } = useGetCategoriesQuery({ 
    limit: 50,
    active: true 
  });

  // Obtener productos para búsqueda general
  const { 
    data: productsData, 
    isLoading: loadingProducts 
  } = useGetProductsQuery({
    page: currentPage,
    limit,
    search: searchTerm,
    sortBy,
    sortOrder
  });

  const categories = categoriesData?.data || [];
  const products = productsData?.products || [];
  const totalProducts = productsData?.total || 0;
  const totalPages = productsData?.totalPages || 0;

  // Función para formatear precio
  const formatPrice = (price, currency = 'COP') => {
    if (!price) return null;
    
    try {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    } catch (error) {
      console.error('Error formateando precio:', error);
      return `$${price.toLocaleString('es-CO')}`;
    }
  };

  // Función para obtener URL de imagen
  const getImageUrl = (item, size = 'mobile') => {
    // Para productos
    if (item?.featuredImage?.[size]?.url) {
      return item.featuredImage[size].url;
    }
    if (item?.images?.length > 0 && item.images[0]?.[size]?.url) {
      return item.images[0][size].url;
    }
    // Para categorías
    if (item?.featuredImage?.thumbnail?.url) {
      return item.featuredImage.thumbnail.url;
    }
    if (item?.featuredImage?.desktop?.url) {
      return item.featuredImage.desktop.url;
    }
    return '/placeholder-product.jpg';
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    const [newSortBy, newSortOrder] = e.target.value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                Inicio
              </Link>
            </li>
            <span className="text-gray-400">/</span>
            <li className="text-gray-900 font-medium">
              Showroom
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nuestros Productos
          </h1>
          <p className="text-gray-600 text-lg">
            Descubre nuestra amplia gama de productos de alta calidad para tu hogar y oficina.
          </p>
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2">
              {totalProducts} resultado{totalProducts !== 1 ? 's' : ''} para "{searchTerm}"
            </p>
          )}
        </div>

        {/* Barra de búsqueda prominente */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar productos por nombre, marca o descripción..."
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mostrar categorías o resultados de búsqueda */}
        {!searchTerm ? (
          /* Navegación por categorías */
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Explorar por Categorías</h2>
            {loadingCategories ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                    <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/showroom/${category.slug}`}
                    className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={getImageUrl(category)}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      <div className="mt-3 inline-flex items-center text-blue-600 text-sm font-medium">
                        Ver productos
                        <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Resultados de búsqueda */
          <div>
            {/* Control de ordenamiento para búsqueda */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                  Ordenar por:
                </label>
                <select
                  id="sort"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={handleSortChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="order-ASC">Posición</option>
                  <option value="name-ASC">Nombre A-Z</option>
                  <option value="name-DESC">Nombre Z-A</option>
                  <option value="price-ASC">Precio menor a mayor</option>
                  <option value="price-DESC">Precio mayor a menor</option>
                  <option value="createdAt-DESC">Más recientes</option>
                </select>
              </div>

              <div className="text-sm text-gray-500">
                Página {currentPage} de {totalPages}
              </div>
            </div>

            {/* Grid de productos */}
            {loadingProducts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      to={`/productos/${product.slug}`}
                      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="aspect-square overflow-hidden rounded-t-lg">
                        <img
                          src={getImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        {product.brand && (
                          <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                        )}
                        {product.price && (
                          <p className="text-lg font-semibold text-gray-900 mt-2">
                            {formatPrice(product.price, product.currency)}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {product.subcategory?.name}
                          </span>
                          <span className={`text-xs font-medium ${
                            product.stock === 0 ? 'text-red-600' :
                            product.stock <= 5 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            Stock: {product.stock}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Anterior
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm rounded-md ${
                              page === currentPage
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 3 ||
                        page === currentPage + 3
                      ) {
                        return <span key={page} className="px-2 py-2 text-sm text-gray-500">...</span>;
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.44-1.01-5.879-2.629m15.758 0A7.966 7.966 0 0112 15c-2.34 0-4.44-1.01-5.879-2.629M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron productos para "{searchTerm}"
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Intenta con otros términos de búsqueda o explora nuestras categorías.
                  </p>
                  <button
                    onClick={clearSearch}
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowroomPage;