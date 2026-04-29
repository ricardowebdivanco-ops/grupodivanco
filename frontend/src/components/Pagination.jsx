const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange = () => {},
  showInfo = true,
  className = '',
  maxVisiblePages = 5
}) => {
  // No mostrar paginación si solo hay una página
  if (totalPages <= 1) return null;

  // Calcular rango de páginas visibles
  const getVisiblePages = () => {
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(currentPage - half, 1);
    let end = Math.min(start + maxVisiblePages - 1, totalPages);
    
    // Ajustar el inicio si estamos cerca del final
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();
  const showFirstPage = visiblePages[0] > 1;
  const showLastPage = visiblePages[visiblePages.length - 1] < totalPages;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Estilos para botones
  const buttonBaseClass = "relative inline-flex items-center px-4 py-2 text-sm font-medium transition-colors focus:z-10 focus:outline-none focus:ring-2 focus:ring-gray-900";
  const activeButtonClass = "z-10 bg-gray-900 text-white focus:ring-offset-2";
  const inactiveButtonClass = "bg-white text-gray-500 hover:bg-gray-50 border border-gray-300";
  const disabledButtonClass = "bg-gray-100 text-gray-400 cursor-not-allowed";

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Información de página */}
      {showInfo && (
        <div className="text-sm text-gray-700">
          Página <span className="font-medium">{currentPage}</span> de{' '}
          <span className="font-medium">{totalPages}</span>
        </div>
      )}

      {/* Controles de paginación */}
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        {/* Botón Previous */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${buttonBaseClass} rounded-l-md border ${
            currentPage === 1 ? disabledButtonClass : inactiveButtonClass
          }`}
          aria-label="Página anterior"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
          </svg>
          <span className="sr-only sm:not-sr-only sm:ml-2">Anterior</span>
        </button>

        {/* Primera página con elipsis */}
        {showFirstPage && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className={`${buttonBaseClass} border ${inactiveButtonClass}`}
              aria-label="Página 1"
            >
              1
            </button>
            {visiblePages[0] > 2 && (
              <span className={`${buttonBaseClass} border bg-white text-gray-700 cursor-default`}>
                ...
              </span>
            )}
          </>
        )}

        {/* Páginas visibles */}
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`${buttonBaseClass} border ${
              page === currentPage ? activeButtonClass : inactiveButtonClass
            }`}
            aria-current={page === currentPage ? 'page' : undefined}
            aria-label={`Página ${page}`}
          >
            {page}
          </button>
        ))}

        {/* Última página con elipsis */}
        {showLastPage && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span className={`${buttonBaseClass} border bg-white text-gray-700 cursor-default`}>
                ...
              </span>
            )}
            <button
              onClick={() => handlePageChange(totalPages)}
              className={`${buttonBaseClass} border ${inactiveButtonClass}`}
              aria-label={`Página ${totalPages}`}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Botón Next */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${buttonBaseClass} rounded-r-md border ${
            currentPage === totalPages ? disabledButtonClass : inactiveButtonClass
          }`}
          aria-label="Página siguiente"
        >
          <span className="sr-only sm:not-sr-only sm:mr-2">Siguiente</span>
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </button>
      </nav>

      {/* Enlaces rápidos para móvil */}
      <div className="flex sm:hidden gap-2">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 text-sm rounded ${
            currentPage === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Primera
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 text-sm rounded ${
            currentPage === totalPages 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Última
        </button>
      </div>
    </div>
  );
};

export default Pagination;
