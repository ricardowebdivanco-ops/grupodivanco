import React, { useState, useEffect } from 'react';
import { useGetCategoriesQuery } from '../../features/categories/categoriesApi';
import { useGetSubcategoriesQuery } from '../../features/subcategories/subcategoriesApi';

const SearchFilters = ({
  filters,
  onFiltersChange,
  isAdvancedMode,
  onAdvancedModeChange
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Obtener categorías y subcategorías dinámicamente
  const { data: categoriesData } = useGetCategoriesQuery({ limit: 100 });
  const { data: subcategoriesData } = useGetSubcategoriesQuery({ limit: 100 });

  const filterOptions = {
    type: [
      { value: '', label: 'Todos los tipos' },
      { value: 'project', label: 'Proyectos' },
      { value: 'post', label: 'Noticias' },
      { value: 'product', label: 'Productos' },
    ],
    projectType: [
      { value: '', label: 'Todos los tipos' },
      { value: 'Diseño', label: 'Diseño' },
      { value: 'Proyecto', label: 'Proyecto' },
      { value: 'Dirección de Obra', label: 'Dirección de Obra' },
    ],
    dateRange: [
      { value: '', label: 'Todas las fechas' },
      { value: '1m', label: 'Último mes' },
      { value: '3m', label: 'Últimos 3 meses' },
      { value: '1y', label: 'Último año' },
    ],
    category: [
      { value: '', label: 'Todas las categorías' },
      ...(categoriesData?.data || []).map(cat => ({
        value: cat.slug,
        label: cat.name
      }))
    ],
    subcategory: [
      { value: '', label: 'Todas las subcategorías' },
      ...(subcategoriesData?.data || []).map(subcat => ({
        value: subcat.slug,
        label: subcat.name
      }))
    ]
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    
    // Limpiar filtros secundarios cuando cambia el tipo
    if (key === 'type') {
      newFilters.category = '';
      newFilters.subcategory = '';
      newFilters.projectType = '';
      newFilters.dateRange = '';
    }
    
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      type: '',
      category: '',
      subcategory: '',
      projectType: '',
      dateRange: '',
      tags: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // Determinar qué filtro secundario mostrar según el tipo seleccionado
  const getSecondaryFilter = () => {
    switch (filters.type) {
      case 'project':
        return 'projectType';
      case 'post':
        return 'dateRange';
      case 'product':
        return 'category';
      default:
        return null;
    }
  };

  const secondaryFilter = getSecondaryFilter();

  return (
    <div className="mb-6">
      {/* Filtros básicos */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Selector de tipo */}
          <div className="flex-1 min-w-48">
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de contenido
            </label>
            <select
              id="type-filter"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {filterOptions.type.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro secundario dinámico */}
          {secondaryFilter && (
            <div className="flex-1 min-w-48">
              <label htmlFor="secondary-filter" className="block text-sm font-medium text-gray-700 mb-1">
                {secondaryFilter === 'projectType' && 'Tipo de proyecto'}
                {secondaryFilter === 'dateRange' && 'Fecha'}
                {secondaryFilter === 'category' && 'Categoría'}
              </label>
              <select
                id="secondary-filter"
                value={filters[secondaryFilter] || ''}
                onChange={(e) => handleFilterChange(secondaryFilter, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {filterOptions[secondaryFilter].map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subcategoría (solo visible cuando tipo es producto y hay categoría seleccionada) */}
          {filters.type === 'product' && filters.category && (
            <div className="flex-1 min-w-48">
              <label htmlFor="subcategory-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Subcategoría
              </label>
              <select
                id="subcategory-filter"
                value={filters.subcategory || ''}
                onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {filterOptions.subcategory
                  .filter(opt => {
                    if (!opt.value) return true;
                    const subcat = subcategoriesData?.data?.find(s => s.slug === opt.value);
                    return subcat?.category?.slug === filters.category;
                  })
                  .map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-end gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
              >
                Limpiar filtros
              </button>
            )}
            
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                showAdvanced
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
              } border`}
            >
              {showAdvanced ? 'Ocultar avanzados' : 'Filtros avanzados'}
              <svg 
                className={`w-4 h-4 ml-1 inline transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filtros avanzados */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Tags */}
              <div>
                <label htmlFor="tags-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (separados por comas)
                </label>
                <input
                  id="tags-filter"
                  type="text"
                  value={filters.tags}
                  onChange={(e) => handleFilterChange('tags', e.target.value)}
                  placeholder="ejemplo: moderno, minimalista, lujo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Modo de búsqueda avanzada */}
              <div className="flex items-center">
                <input
                  id="advanced-mode"
                  type="checkbox"
                  checked={isAdvancedMode}
                  onChange={(e) => onAdvancedModeChange(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="advanced-mode" className="ml-2 block text-sm text-gray-700">
                  Búsqueda avanzada
                  <span className="block text-xs text-gray-500">
                    Incluye más opciones de filtrado
                  </span>
                </label>
              </div>
            </div>

            {/* Ayuda para filtros avanzados */}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Tips de búsqueda:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Usa comillas para buscar frases exactas: "cocina moderna"</li>
                <li>• Separa términos con comas en los tags</li>
                <li>• Los filtros se combinan para refinar los resultados</li>
                <li>• La búsqueda avanzada incluye contenido en metadatos</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Indicadores de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          
          {filters.type && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {filterOptions.type.find(opt => opt.value === filters.type)?.label}
              <button
                onClick={() => handleFilterChange('type', '')}
                className="ml-1 hover:text-blue-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}

          {filters.projectType && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {filterOptions.projectType.find(opt => opt.value === filters.projectType)?.label}
              <button
                onClick={() => handleFilterChange('projectType', '')}
                className="ml-1 hover:text-green-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}

          {filters.dateRange && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {filterOptions.dateRange.find(opt => opt.value === filters.dateRange)?.label}
              <button
                onClick={() => handleFilterChange('dateRange', '')}
                className="ml-1 hover:text-yellow-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}

          {filters.category && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {filterOptions.category.find(opt => opt.value === filters.category)?.label}
              <button
                onClick={() => handleFilterChange('category', '')}
                className="ml-1 hover:text-green-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}

          {filters.subcategory && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {filterOptions.subcategory.find(opt => opt.value === filters.subcategory)?.label}
              <button
                onClick={() => handleFilterChange('subcategory', '')}
                className="ml-1 hover:text-orange-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}

          {filters.tags && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Tags: {filters.tags}
              <button
                onClick={() => handleFilterChange('tags', '')}
                className="ml-1 hover:text-purple-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
