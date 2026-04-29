import { useState } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ 
  product, 
  showCategory = true, 
  showSubcategory = true,
  className = '',
  imageClassName = '',
  onImageError = null
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    if (onImageError) {
      onImageError(product);
    }
  };

  const mainImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : null;

  const imageUrl = mainImage?.desktop?.url || mainImage?.mobile?.url || mainImage?.thumbnail?.url;

  const formatPrice = (price) => {
    if (!price) return 'Consultar precio';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className={`group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${className}`}>
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.featured && (
          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            Destacado
          </span>
        )}
        {product.isNew && (
          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            Nuevo
          </span>
        )}
        {product.isOnSale && (
          <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            Oferta
          </span>
        )}
      </div>

      {/* Stock Badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          product.stock === 0 ? 'bg-red-100 text-red-800' :
          product.stock <= 5 ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          Stock: {product.stock}
        </span>
      </div>

      {/* Image */}
      <Link to={`/productos/${product.slug}`} className="block relative">
        <div className={`aspect-[4/3] bg-gray-100 overflow-hidden ${imageClassName}`}>
          {imageUrl && !imageError ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                </div>
              )}
              <img
                src={imageUrl}
                alt={product.name}
                className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
              />
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg 
                className="w-12 h-12 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Category & Subcategory */}
        {(showCategory || showSubcategory) && (
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
            {showCategory && product.Subcategory?.Category && (
              <>
                <Link 
                  to={`/showroom/${product.Subcategory.Category.slug}`}
                  className="hover:text-gray-700 transition-colors"
                >
                  {product.Subcategory.Category.name}
                </Link>
                {showSubcategory && <span>•</span>}
              </>
            )}
            {showSubcategory && product.Subcategory && (
              <Link 
                to={`/showroom/${product.Subcategory.Category?.slug}/${product.Subcategory.slug}`}
                className="hover:text-gray-700 transition-colors"
              >
                {product.Subcategory.name}
              </Link>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          <Link 
            to={`/productos/${product.slug}`}
            className="hover:text-gray-700 transition-colors"
          >
            {product.name}
          </Link>
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-500 mb-2">
            <span className="font-medium">Marca:</span> {product.brand}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            {product.salePrice ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-red-600">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Action Button */}
          <Link
            to={`/productos/${product.slug}`}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Ver más
          </Link>
        </div>

        {/* Specifications Preview */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-1">
              {Object.entries(product.specifications).slice(0, 3).map(([key, value]) => (
                <span 
                  key={key}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  {key}: {value}
                </span>
              ))}
              {Object.keys(product.specifications).length > 3 && (
                <span className="text-xs text-gray-500">
                  +{Object.keys(product.specifications).length - 3} más
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
