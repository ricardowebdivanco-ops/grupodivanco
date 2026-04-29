import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProduct } from '../features/products/useProducts';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { product, isLoading, error } = useProduct(slug);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Helper function para obtener URLs de imágenes
  const getImageUrl = (image, size = 'desktop') => {
    if (!image) return null;
    return image[size]?.url || image.desktop?.url || image.mobile?.url || image.thumbnail?.url;
  };

  // Formatear precio en COP
  const formatPrice = (price) => {
    console.log('💰 Formateando precio:', price, typeof price);
    if (!price) return 'Precio no disponible';
    
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    console.log('💰 Precio numérico:', numericPrice);
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericPrice);
  };

  // Estados de stock
  const getStockStatus = (stock) => {
    const color = stock === 0 ? 'bg-red-100 text-red-800' :
                  stock <= 5 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800';
    return { text: `Stock: ${stock}`, color };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    console.error('❌ Error al cargar producto:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <p className="text-gray-600">El producto que buscas no existe o ha sido eliminado.</p>
        </div>
      </div>
    );
  }

  if (!product) {
    console.warn('⚠️ Producto es null o undefined');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <p className="text-gray-600">El producto que buscas no existe.</p>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const hasImages = images.length > 0;
  const selectedImage = hasImages ? images[selectedImageIndex] : null;
  const mainImageUrl = getImageUrl(selectedImage, 'desktop');
  const stockStatus = getStockStatus(product.stock || 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 md:pt-28 lg:pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8 gap-y-8 lg:gap-y-0 p-6 lg:p-0">
            
            {/* SECCIÓN DE IMÁGENES - Lado izquierdo */}
            <div className="lg:bg-gray-50 lg:p-8 flex flex-col justify-center">
              <div className="flex flex-col gap-4">
                
                {/* IMAGEN PRINCIPAL */}
                <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 flex items-center justify-center min-h-96">
                  {mainImageUrl ? (
                    <img
                      src={mainImageUrl}
                      alt={product.name}
                      className="w-full h-auto object-contain p-4"
                      style={{ maxHeight: '500px' }}
                      onLoad={() => console.log('✅ Imagen cargada exitosamente:', mainImageUrl)}
                      onError={() => console.error('❌ Error al cargar imagen:', mainImageUrl)}
                    />
                  ) : (
                    <div className="w-full h-96 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">Sin imagen</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* MINIATURAS - Siempre horizontales */}
                {hasImages && images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((image, index) => {
                      const thumbnailUrl = getImageUrl(image, 'thumbnail');
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            selectedImageIndex === index 
                              ? 'border-blue-500 ring-2 ring-blue-200' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {thumbnailUrl ? (
                            <img
                              src={thumbnailUrl}
                              alt={`${product.name} - imagen ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* INFORMACIÓN DEL PRODUCTO - Lado derecho */}
            <div className="lg:p-8 flex flex-col justify-start">
              <div>
                {/* Breadcrumb */}
                <nav className="flex mb-6" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2 text-sm text-gray-500">
                    <li>
                      <a href="/showroom" className="hover:text-gray-700">Showroom</a>
                    </li>
                    {product.subcategory?.category && (
                      <>
                        <li>
                          <span>/</span>
                        </li>
                        <li>
                          <a 
                            href={`/showroom/${product.subcategory.category.slug}`} 
                            className="hover:text-gray-700"
                          >
                            {product.subcategory.category.name}
                          </a>
                        </li>
                      </>
                    )}
                    {product.subcategory && (
                      <>
                        <li>
                          <span>/</span>
                        </li>
                        <li>
                          <a 
                            href={`/showroom/${product.subcategory.category?.slug}`} 
                            className="hover:text-gray-700"
                          >
                            {product.subcategory.name}
                          </a>
                        </li>
                      </>
                    )}
                  </ol>
                </nav>

                {/* Título y badges */}
                <div className="mb-6">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    {product.name}
                  </h1>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.isFeatured && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⭐ Destacado
                      </span>
                    )}
                    {product.isNew && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        🆕 Nuevo
                      </span>
                    )}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </div>
                </div>

                {/* Precio */}
                <div className="mb-8">
                  <p className="text-4xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </p>
                  {product.currency && (
                    <p className="text-sm text-gray-500 mt-1">
                      Precio en {product.currency}
                    </p>
                  )}
                </div>

                {/* Descripción */}
                {product.description && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Descripción
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-base">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Especificaciones */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Especificaciones
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
                        {/* Renderizar dimensiones si existen */}
                        {product.specifications.dimensions &&
                          Object.entries(product.specifications.dimensions).map(([key, value]) => (
                            <React.Fragment key={"dim-" + key}>
                              <div className="text-sm font-semibold text-gray-700 col-span-1">{key}</div>
                              <div className="text-sm text-gray-900 col-span-1">{value}</div>
                            </React.Fragment>
                          ))}
                        {/* Renderizar otras especificaciones (excluyendo dimensiones) */}
                        {Object.entries(product.specifications)
                          .filter(([key]) => key !== "dimensions")
                          .map(([key, value]) => {
                            const formattedKey = key
                              .replace(/_/g, ' ')
                              .split(' ')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                              .join(' ');
                            const formattedValue = Array.isArray(value) ? value.join(', ') : value;
                            return (
                              <React.Fragment key={key}>
                                <div className="text-sm font-semibold text-gray-700 col-span-1">{formattedKey}</div>
                                <div className="text-sm text-gray-900 col-span-1">{formattedValue}</div>
                              </React.Fragment>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Información adicional */}
                <div className="border-t border-gray-200 pt-8 mb-8">
                  <div className="grid grid-cols-2 gap-4 text-sm mb-8">
                    {product.brand && (
                      <div>
                        <span className="text-gray-600 font-medium">Marca:</span>
                        <p className="text-gray-900 mt-1">{product.brand}</p>
                      </div>
                    )}
                    {product.model && (
                      <div>
                        <span className="text-gray-600 font-medium">Modelo:</span>
                        <p className="text-gray-900 mt-1">{product.model}</p>
                      </div>
                    )}
                    {product.sku && (
                      <div>
                        <span className="text-gray-600 font-medium">SKU:</span>
                        <p className="text-gray-900 mt-1">{product.sku}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600 font-medium">Stock:</span>
                      <p className="text-gray-900 mt-1">{product.stock || 0} unidades</p>
                    </div>
                  </div>

                  {/* Botón de WhatsApp */}
                  <div className="mt-8">
                    <a
                      href={`https://wa.me/573105706816?text=${encodeURIComponent(product.whatsappMessage || `Hola! Me interesa el producto "${product.name}". ¿Podrían brindarme más información?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-green-600 hover:bg-green-700 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white transition-colors duration-200"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.520-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.119"/>
                      </svg>
                      Consultar por WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
