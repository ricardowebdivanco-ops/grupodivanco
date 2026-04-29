import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetProductsByCategoryQuery } from '../features/products/productsApi';
import { useGetCategoriesQuery } from '../features/categories/categoriesApi';
import { useGetSubcategoriesQuery } from '../features/subcategories/subcategoriesApi';

const CategoryProductsPage = () => {
  const { categorySlug } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 12;

  // Queries para productos, categorías y subcategorías
  const {
    data,
    isLoading,
    error,
    refetch
  } = useGetProductsByCategoryQuery({
    categorySlug,
    page: currentPage,
    limit,
    sortBy,
    sortOrder,
    search: searchTerm
  });

  const { data: categoriesData } = useGetCategoriesQuery({ limit: 50 });
  const { data: subcategoriesData } = useGetSubcategoriesQuery({ 
    categoryId: data?.category?.id,
    limit: 50 
  });

  const { products = [], category, total = 0, totalPages = 0 } = data || {};
  const categories = categoriesData?.data || [];
  const subcategories = subcategoriesData?.data || [];

  // Filtrar productos por búsqueda del lado cliente para respuesta más rápida
  const filteredProducts = products.filter(product => 
    searchTerm === '' || 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Manejar cambio de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
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
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
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
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Error al cargar la categoría
            </h2>
            <p className="text-gray-600 mb-4">
              No se pudo cargar la información de la categoría.
            </p>
            <button
              onClick={refetch}
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
              <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                Inicio
              </Link>
            </li>
            <span className="text-gray-400">/</span>
            <li>
              <Link to="/showroom" className="text-gray-500 hover:text-gray-700 transition-colors">
                Showroom
              </Link>
            </li>
            {category && (
              <>
                <span className="text-gray-400">/</span>
                <li className="text-gray-900 font-medium">
                  {category.name}
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* Header de categoría */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {category?.name || 'Nuestros Productos'}
          </h1>
          {category?.description && (
            <p className="text-gray-600 text-lg">
              {category.description}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            {searchTerm ? filteredProducts.length : total} producto{(searchTerm ? filteredProducts.length : total) !== 1 ? 's' : ''} 
            {searchTerm ? ` encontrado${filteredProducts.length !== 1 ? 's' : ''} para "${searchTerm}"` : ' en total'}
          </p>
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

        {/* Navegación por categorías y subcategorías */}
        <div className="mb-8">
          {/* Categorías */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Explorar por Categorías</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/showroom"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !categorySlug 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas las categorías
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/showroom/${cat.slug}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    cat.slug === categorySlug 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Subcategorías de la categoría actual */}
          {category && subcategories.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">
                Subcategorías en {category.name}
              </h4>
              <div className="flex flex-wrap gap-2">
                {subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    to={`/subcategoria/${subcategory.slug}`}
                    className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-md text-sm hover:bg-orange-200 transition-colors"
                  >
                    {subcategory.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Control de ordenamiento */}
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
        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {filteredProducts.map((product) => (
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

            {/* Paginación - solo mostrar si no hay búsqueda activa */}
            {!searchTerm && totalPages > 1 && (
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
                {searchTerm ? `No se encontraron productos para "${searchTerm}"` : 'No hay productos en esta categoría'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda o explora nuestras categorías.'
                  : 'Revisa otras categorías en nuestro showroom.'
                }
              </p>
              {searchTerm ? (
                <button
                  onClick={clearSearch}
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Limpiar búsqueda
                </button>
              ) : (
                <Link
                  to="/showroom"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Ver todas las categorías
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProductsPage;