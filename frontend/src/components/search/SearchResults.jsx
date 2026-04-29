import React from 'react';
import { Link } from 'react-router-dom';

const SearchResults = ({
  results,
  total,
  query
}) => {
  
  const getTypeIcon = (type) => {
    const icons = {
      project: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      post: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      category: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      subcategory: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      product: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    };
    return icons[type] || icons.project;
  };

  const getTypeColor = (type) => {
    const colors = {
      project: 'text-blue-600 bg-blue-100',
      post: 'text-green-600 bg-green-100',
      category: 'text-purple-600 bg-purple-100',
      subcategory: 'text-orange-600 bg-orange-100',
      product: 'text-red-600 bg-red-100'
    };
    return colors[type] || colors.project;
  };

  const getItemLink = (item) => {
    // Prefer backend-provided url if present
    if (item.url) return item.url;
    
    const linkMap = {
      project: `/proyectos/${item.slug}`,
      post: `/noticias/${item.slug}`,
      category: `/productos/categoria/${item.slug}`,
      subcategory: item.category 
        ? `/productos/categoria/${item.category.slug || item.category}/${item.slug}`
        : `/productos/categoria/sin-categoria/${item.slug}`,
      product: `/productos/${item.slug}`
    };
    
    return linkMap[item.type] || '#';
  };

  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 font-medium">$1</mark>');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const ResultCard = ({ item }) => (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden group">
      <Link to={getItemLink(item)} className="block">
        
        {/* Imagen si existe */}
        {item.featuredImage && (
          <div className="aspect-w-16 aspect-h-9 bg-gray-200">
            <img
              src={item.featuredImage}
              alt={item.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="p-4">
          {/* Header con tipo y fecha */}
          <div className="flex items-center justify-between mb-2">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
              {getTypeIcon(item.type)}
              <span className="ml-1 capitalize">{item.type}</span>
            </div>
            {item.publishedAt && (
              <span className="text-xs text-gray-500">
                {formatDate(item.publishedAt)}
              </span>
            )}
          </div>

          {/* Título */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            <span dangerouslySetInnerHTML={{
              __html: highlightText(item.title, query)
            }} />
          </h3>

          {/* Descripción */}
          {item.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              <span dangerouslySetInnerHTML={{
                __html: highlightText(item.description, query)
              }} />
            </p>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {item.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{item.tags.length - 3} más
                </span>
              )}
            </div>
          )}

          {/* Información adicional */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            {item.category && (
              <span>Categoría: {typeof item.category === 'object' ? (item.category.name || item.category.slug) : item.category}</span>
            )}
            {item.subcategory && (
              <span className="ml-4">Subcategoría: {typeof item.subcategory === 'object' ? (item.subcategory.name || item.subcategory.slug) : item.subcategory}</span>
            )}
            
            <div className="flex items-center text-blue-600 group-hover:text-blue-800">
              <span className="mr-1">Ver más</span>
              <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );

  // Agrupar resultados por tipo
  const groupedResults = results.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {});

  const typeLabels = {
    project: 'Proyectos',
    post: 'Noticias',
    category: 'Categorías',
    subcategory: 'Subcategorías',
    product: 'Productos'
  };

  return (
    <div className="space-y-8">
      
      {/* Resultados agrupados por tipo */}
      {Object.entries(groupedResults).map(([type, items]) => (
        <div key={type}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className={`p-2 rounded-lg mr-3 ${getTypeColor(type)}`}>
              {getTypeIcon(type)}
            </span>
            {typeLabels[type]} ({items.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <ResultCard key={`${type}-${item.id || index}`} item={item} />
            ))}
          </div>
        </div>
      ))}

      {/* Lista simple si hay pocos resultados */}
      {Object.keys(groupedResults).length === 1 && results.length <= 3 && (
        <div className="space-y-4">
          {results.map((item, index) => (
            <ResultCard key={item.id || index} item={item} />
          ))}
        </div>
      )}

    </div>
  );
};

export default SearchResults;
