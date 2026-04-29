import React, { useState, useRef, useEffect } from 'react';
import { useGetSearchSuggestionsQuery } from '../../features/search/searchApi';

const SearchBar = ({
  query,
  onQueryChange,
  onSearch,
  isLoading,
  searchHistory = [],
  onClearHistory,
  placeholder = "Buscar..."
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Obtener sugerencias si hay query
  const { data: suggestions } = useGetSearchSuggestionsQuery(query, {
    skip: !query || query.length < 2
  });

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch();
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    onQueryChange(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    const suggestionText = typeof suggestion === 'string' ? suggestion : 
                          suggestion.text || suggestion.suggestion || suggestion.title || suggestion.name || '';
    onQueryChange(suggestionText);
    setShowSuggestions(false);
    onSearch();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const combinedSuggestions = [
    ...searchHistory.slice(0, 3),
    ...(suggestions?.data || []).map(item => 
      typeof item === 'string' ? item : item.text || item.suggestion || item.title || item.name || ''
    ).slice(0, 5)
  ].filter((item, index, self) => {
    const itemStr = typeof item === 'string' ? item : String(item);
    const queryStr = String(query).toLowerCase();
    return self.indexOf(item) === index && 
           itemStr.toLowerCase().includes(queryStr) &&
           itemStr.trim() !== '';
  });

  return (
    <div ref={containerRef} className="relative mb-6">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`
              w-full h-14 pl-6 pr-24 text-lg border-2 rounded-full
              bg-white shadow-sm transition-all duration-200
              ${isFocused 
                ? 'border-blue-500 shadow-lg ring-4 ring-blue-100' 
                : 'border-gray-200 hover:border-gray-300'
              }
              ${isLoading ? 'pr-32' : 'pr-24'}
            `}
          />
          
          {/* Spinner de carga */}
          {isLoading && (
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Botón de búsqueda */}
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className={`
              absolute right-2 top-1/2 transform -translate-y-1/2
              w-10 h-10 rounded-full flex items-center justify-center
              transition-all duration-200
              ${query.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Botón limpiar */}
          {query && (
            <button
              type="button"
              onClick={() => {
                onQueryChange('');
                inputRef.current?.focus();
              }}
              className="absolute right-14 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-600 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Sugerencias y historial */}
      {showSuggestions && (query || searchHistory.length > 0) && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl mt-2 z-50 max-h-80 overflow-y-auto">
          
          {/* Historial de búsquedas */}
          {searchHistory.length > 0 && !query && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Búsquedas recientes</h4>
                <button
                  onClick={onClearHistory}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Limpiar
                </button>
              </div>
              <div className="space-y-1">
                {searchHistory.slice(0, 5).map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(term)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center"
                  >
                    <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sugerencias */}
          {combinedSuggestions.length > 0 && query && (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Sugerencias</h4>
              <div className="space-y-1">
                {combinedSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center"
                  >
                    <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span dangerouslySetInnerHTML={{
                      __html: (() => {
                        const suggestionText = typeof suggestion === 'string' ? suggestion : 
                                              suggestion.text || suggestion.suggestion || suggestion.title || suggestion.name || '';
                        return suggestionText.replace(
                          new RegExp(`(${query})`, 'gi'),
                          '<mark class="bg-yellow-200">$1</mark>'
                        );
                      })()
                    }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sin sugerencias */}
          {query && combinedSuggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No hay sugerencias disponibles
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
