import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  useLazyGlobalSearchQuery, 
  useLazyAdvancedSearchQuery,
  useGetSearchSuggestionsQuery 
} from '../../features/search/searchApi';
import { SearchBar, SearchFilters, SearchResults, SearchSkeleton, Pagination } from '../../components/search';
import { useDebounce } from '../../hooks/useDebounce';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Estados
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    projectType: searchParams.get('projectType') || '',
    dateRange: searchParams.get('dateRange') || '',
    tags: searchParams.get('tags') || '',
  });
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchHistory, setSearchHistory] = useState([]);

  // Debounce para evitar búsquedas excesivas
  const debouncedQuery = useDebounce(query, 300);

  // API hooks
  const [triggerGlobalSearch, globalSearchResult] = useLazyGlobalSearchQuery();
  const [triggerAdvancedSearch, advancedSearchResult] = useLazyAdvancedSearchQuery();

  // Resultado actual basado en el modo de búsqueda
  const searchResult = isAdvancedMode ? advancedSearchResult : globalSearchResult;
  const { data, isLoading, error } = searchResult;

  // Efectos
  useEffect(() => {
    // Cargar historial desde localStorage
    const savedHistory = localStorage.getItem('divanco_search_history');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    // Actualizar URL cuando cambian los parámetros
    const newSearchParams = new URLSearchParams();
    if (debouncedQuery) newSearchParams.set('q', debouncedQuery);
    if (filters.type) newSearchParams.set('type', filters.type);
    if (filters.category) newSearchParams.set('category', filters.category);
    if (filters.subcategory) newSearchParams.set('subcategory', filters.subcategory);
    if (filters.projectType) newSearchParams.set('projectType', filters.projectType);
    if (filters.dateRange) newSearchParams.set('dateRange', filters.dateRange);
    if (filters.tags) newSearchParams.set('tags', filters.tags);
    if (currentPage > 1) newSearchParams.set('page', currentPage.toString());

    setSearchParams(newSearchParams);
  }, [debouncedQuery, filters, currentPage, setSearchParams]);

  useEffect(() => {
    // Ejecutar búsqueda cuando cambian los parámetros
    // Permitir búsqueda con solo filtros o con query
    if (debouncedQuery.trim() || filters.type) {
      performSearch();
    }
  }, [debouncedQuery, filters, currentPage]);

  // Funciones
  const performSearch = () => {
    // Mapear tipos del frontend a los que espera el backend
    const typeMap = {
      'project': 'projects',
      'post': 'blog',
      'product': 'products',
      '': 'all'
    };
    
    const backendType = typeMap[filters.type] || 'all';
    
    const searchParams = {
      q: debouncedQuery || '*', // Usar * como wildcard si no hay query
      limit: 20,
      page: currentPage,
      type: backendType,
    };
    
    // Agregar filtros adicionales si existen
    if (filters.category) searchParams.category = filters.category;
    if (filters.subcategory) searchParams.subcategory = filters.subcategory;
    if (filters.projectType) searchParams.projectType = filters.projectType;
    if (filters.dateRange) searchParams.dateRange = filters.dateRange;

    if (isAdvancedMode) {
      triggerAdvancedSearch({
        ...searchParams,
        filters: filters,
      });
    } else {
      triggerGlobalSearch(searchParams);
    }

    // Agregar a historial solo si hay query real
    if (debouncedQuery.trim()) {
      addToHistory(debouncedQuery);
    }
  };

  const addToHistory = (searchTerm) => {
    const newHistory = [
      searchTerm,
      ...searchHistory.filter(term => term !== searchTerm)
    ].slice(0, 10); // Mantener solo los últimos 10

    setSearchHistory(newHistory);
    localStorage.setItem('divanco_search_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('divanco_search_history');
  };

  const handleQueryChange = (newQuery) => {
    setQuery(newQuery);
    setCurrentPage(1); // Reset página al cambiar query
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset página al cambiar filtros
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll al inicio al cambiar página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Función para normalizar los resultados a un array
  const normalizeResults = useMemo(() => {
    if (!data?.data) return [];
    
    const results = data.data;
    
    // Si results es un array (búsqueda específica), devolverlo tal como está
    if (Array.isArray(results)) {
      return results;
    }
    
    // Si results es un objeto (búsqueda general), combinar todos los arrays
    if (results && typeof results === 'object') {
      const allResults = [];
      
      // Agregar categorías
      if (results.categories && Array.isArray(results.categories)) {
        allResults.push(...results.categories.map(item => ({
          ...item,
          type: 'category',
          url: `/productos/categoria/${item.slug}`
        })));
      }
      
      // Agregar subcategorías
      if (results.subcategories && Array.isArray(results.subcategories)) {
        allResults.push(...results.subcategories.map(item => ({
          ...item,
          type: 'subcategory',
          url: item.category 
            ? `/productos/categoria/${item.category.slug || item.category}/${item.slug}`
            : `/productos/categoria/sin-categoria/${item.slug}`
        })));
      }
      
      // Agregar proyectos
      if (results.projects && Array.isArray(results.projects)) {
        allResults.push(...results.projects);
      }
      
      // Agregar posts (blogPosts)
      if (results.blogPosts && Array.isArray(results.blogPosts)) {
        allResults.push(...results.blogPosts);
      }
      
      // Agregar productos si existen
      if (results.products && Array.isArray(results.products)) {
        allResults.push(...results.products);
      }
      
      return allResults;
    }
    
    return [];
  }, [data]);

  // Estadísticas de búsqueda
  const searchStats = useMemo(() => {
    if (!data?.data) return null;
    
    const results = normalizeResults;
    const total = data.total || results.length;
    
    return {
      total,
      projects: results.filter(item => item.type === 'project').length,
      posts: results.filter(item => item.type === 'post').length,
      categories: results.filter(item => item.type === 'category').length,
      subcategories: results.filter(item => item.type === 'subcategory').length,
      products: results.filter(item => item.type === 'product').length,
    };
  }, [data, normalizeResults]);

  return (
    <>
      <Helmet>
        <title>
          {query ? `Búsqueda: ${query} - DIVANCO` : 'Búsqueda - DIVANCO'}
        </title>
        <meta 
          name="description" 
          content={`Busca proyectos, productos, categorías y contenido en DIVANCO${query ? `: ${query}` : ''}`} 
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header de búsqueda */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-light text-gray-900 mb-2">
              Búsqueda
              {query && (
                <span className="block text-lg font-normal text-gray-600 mt-1">
                  Resultados para: "{query}"
                </span>
              )}
            </h1>
          </div>

          {/* Barra de búsqueda */}
          <SearchBar
            query={query}
            onQueryChange={handleQueryChange}
            onSearch={() => performSearch()}
            isLoading={isLoading}
            searchHistory={searchHistory}
            onClearHistory={clearHistory}
            placeholder="Buscar proyectos, productos, categorías..."
          />

          {/* Filtros */}
          <SearchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isAdvancedMode={isAdvancedMode}
            onAdvancedModeChange={setIsAdvancedMode}
          />

          {/* Estadísticas */}
          {searchStats && (
            <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="font-medium text-gray-900">
                  {searchStats.total} resultados encontrados
                </span>
                {searchStats.projects > 0 && (
                  <span>{searchStats.projects} proyectos</span>
                )}
                {searchStats.posts > 0 && (
                  <span>{searchStats.posts} artículos</span>
                )}
                {searchStats.categories > 0 && (
                  <span>{searchStats.categories} categorías</span>
                )}
                {searchStats.subcategories > 0 && (
                  <span>{searchStats.subcategories} subcategorías</span>
                )}
                {searchStats.products > 0 && (
                  <span>{searchStats.products} productos</span>
                )}
              </div>
            </div>
          )}

          {/* Resultados */}
          {isLoading ? (
            <SearchSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error en la búsqueda</h3>
              <p className="text-gray-600 mb-4">No pudimos completar tu búsqueda. Inténtalo de nuevo.</p>
              <button
                onClick={() => performSearch()}
                className="btn btn-primary"
              >
                Reintentar
              </button>
            </div>
          ) : normalizeResults.length > 0 ? (
            <>
              <SearchResults
                results={normalizeResults}
                total={data.total || normalizeResults.length}
                query={query}
              />
              
              {/* Paginación */}
              {(data.total || normalizeResults.length) > 20 && (
                <div className="flex justify-center mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil((data.total || normalizeResults.length) / 20)}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : query ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sin resultados</h3>
              <p className="text-gray-600 mb-4">
                No encontramos resultados para "{query}". Intenta con otros términos.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Sugerencias:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Verifica la ortografía</li>
                  <li>• Usa términos más generales</li>
                  <li>• Prueba con sinónimos</li>
                  <li>• Usa menos filtros</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Comienza tu búsqueda</h3>
              <p className="text-gray-600">
                Busca proyectos, productos, categorías y más contenido de DIVANCO.
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default SearchPage;