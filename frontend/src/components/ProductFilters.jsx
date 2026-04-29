import { useState, useEffect } from 'react';
import { useGetCategoriesQuery } from '../features/categories/categoriesApi';

const ProductFilters = ({
  filters = {},
  onFilterChange = () => {},
  onReset = () => {},
  isLoading = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.data || []; // ✅ Cambiar de .categories a .data

  // Sync local filters with parent
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleLocalFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    
    // Reset subcategory when category changes
    if (key === 'categoryId') {
      newFilters.subcategoryId = null;
    }
    
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    setLocalFilters({
      search: '',
      categoryId: null,
      subcategoryId: null,
      featured: undefined,
      isNew: undefined,
      brand: '',
      priceMin: '',
      priceMax: '',
      sortBy: 'order',
      sortOrder: 'ASC'
    });
    onReset();
    setIsOpen(false);
  };

  const selectedCategory = categories.find(cat => cat.id === localFilters.categoryId);
  const subcategories = selectedCategory?.subcategories || [];

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.categoryId) count++;
    if (localFilters.subcategoryId) count++;
    if (localFilters.featured !== undefined) count++;
    if (localFilters.isNew !== undefined) count++;
    if (localFilters.brand) count++;
    if (localFilters.priceMin || localFilters.priceMax) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={`relative ${className}`}>
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        disabled={isLoading}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
        </svg>
        <span>Filtros</span>
        {activeFiltersCount > 0 && (
          <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full">
            {activeFiltersCount}
          </span>
        )}
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filters Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={localFilters.search || ''}
                onChange={(e) => handleLocalFilterChange('search', e.target.value)}
                placeholder="Nombre del producto..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={localFilters.categoryId || ''}
                onChange={(e) => handleLocalFilterChange('categoryId', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategoría
              </label>
              <select
                value={localFilters.subcategoryId || ''}
                onChange={(e) => handleLocalFilterChange('subcategoryId', e.target.value || null)}
                disabled={!selectedCategory}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Todas las subcategorías</option>
                {subcategories.map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <input
                type="text"
                value={localFilters.brand || ''}
                onChange={(e) => handleLocalFilterChange('brand', e.target.value)}
                placeholder="Nombre de la marca..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rango de precio
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={localFilters.priceMin || ''}
                  onChange={(e) => handleLocalFilterChange('priceMin', e.target.value)}
                  placeholder="Min"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <input
                  type="number"
                  value={localFilters.priceMax || ''}
                  onChange={(e) => handleLocalFilterChange('priceMax', e.target.value)}
                  placeholder="Max"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            {/* Special Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtros especiales
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.featured === true}
                    onChange={(e) => handleLocalFilterChange('featured', e.target.checked ? true : undefined)}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="ml-2 text-sm">Solo destacados</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.isNew === true}
                    onChange={(e) => handleLocalFilterChange('isNew', e.target.checked ? true : undefined)}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="ml-2 text-sm">Solo productos nuevos</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={resetFilters}
              className="text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isLoading}
            >
              Limpiar filtros
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Aplicando...' : 'Aplicar filtros'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductFilters;
