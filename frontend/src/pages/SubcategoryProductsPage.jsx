import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetProductsBySubcategoryQuery } from '../features/products/productsApi';

const SubcategoryProductsPage = () => {
  const { categorySlug, subcategorySlug } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState('ASC');
  const limit = 12;

  const {
    data,
    isLoading,
    error,
    refetch
  } = useGetProductsBySubcategoryQuery({
    subcategorySlug,
    page: currentPage,
    limit,
    sortBy,
    sortOrder
  });

  const { products = [], subcategory, total = 0, totalPages = 0 } = data || {};

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
  const getImageUrl = (product, size = 'mobile') => {
    // Primero intentar featuredImage con la estructura correcta
    if (product?.featuredImage?.[size]?.url) {
      return product.featuredImage[size].url;
    }
    // Fallback a images array
    if (product?.images?.length > 0 && product.images[0]?.[size]?.url) {
      return product.images[0][size].url;
    }
    // Fallback para estructura legacy con urls
    if (product?.featuredImage?.urls?.[size]) {
      return product.featuredImage.urls[size];
    }
    if (product?.images?.length > 0 && product.images[0]?.urls?.[size]) {
      return product.images[0].urls[size];
    }
    return '/placeholder-product.jpg';
  };

  // Manejar cambio de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Manejar cambio de ordenamiento
  const handleSortChange = (e) => {
    const [newSortBy, newSortOrder] = e.target.value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Error al cargar productos
            </h1>
            <p className="text-gray-600 mb-6">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                Inicio
              </Link>
            </li>
            <span className="text-gray-400">/</span>
            <li>
              <Link to="/showroom" className="text-gray-500 hover:text-gray-700">
                Salón de Ventas
              </Link>
            </li>
            <span className="text-gray-400">/</span>
            <li>
              <Link 
                to={`/showroom/${subcategory?.category?.slug}`} 
                className="text-gray-500 hover:text-gray-700"
              >
                {subcategory?.category?.name}
              </Link>
            </li>
            <span className="text-gray-400">/</span>
            <li className="text-gray-900 font-medium">
              {subcategory?.name}
            </li>
          </ol>
        </nav>

        {/* Header de subcategoría */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {subcategory?.name}
          </h1>
          {subcategory?.description && (
            <p className="text-gray-600 text-lg">
              {subcategory.description}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            {total} producto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Controles de ordenamiento */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700">
              Ordenar por:
            </label>
            <select
              id="sort"
              value={`${sortBy}-${sortOrder}`}
              onChange={handleSortChange}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        {products.length > 0 ? (
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
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
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
                      {product.isFeatured && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Destacado
                        </span>
                      )}
                      {product.isNew && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Nuevo
                        </span>
                      )}
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
                        className={`px-3 py-2 text-sm border rounded-md ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 3 ||
                    page === currentPage + 3
                  ) {
                    return (
                      <span key={page} className="px-2 py-2 text-sm text-gray-500">
                        ...
                      </span>
                    );
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
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay productos en esta subcategoría
            </h3>
            <p className="text-gray-600">
              Revisa otras subcategorías o explora toda la categoría.
            </p>
            <div className="flex gap-4 justify-center mt-4">
              <Link
                to={`/showroom/${subcategory?.category?.slug}`}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Ver toda la categoría
              </Link>
              <Link
                to="/showroom"
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
              >
                Ver Salón de Ventas
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubcategoryProductsPage;
