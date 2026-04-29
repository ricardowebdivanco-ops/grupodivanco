import { useState } from 'react';
import { 
  useGetSubscribersQuery,
  useGetSubscriberStatsQuery,
  useDeleteSubscriberMutation
} from '../../features/subscriber/subscriberApi';
import { useUI } from '../../hooks/useUI';
import { Button, Input, Loading } from '../../components/ui';
import { 
  TrashIcon, 
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const AdminSubscribersPage = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('active');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { showSuccess, showError } = useUI();

  // Queries
  const { 
    data: subscribersResponse, 
    isLoading, 
    error 
  } = useGetSubscribersQuery({ 
    limit: 50, 
    page, 
    status,
    search 
  });

  const { 
    data: statsResponse 
  } = useGetSubscriberStatsQuery();

  // Mutations
  const [deleteSubscriber] = useDeleteSubscriberMutation();

  const subscribers = subscribersResponse?.data || [];
  const pagination = subscribersResponse?.pagination || {};
  const stats = statsResponse?.data || {};

  const handleDeleteSubscriber = async (subscriberId, email) => {
    if (window.confirm(`¿Estás seguro de eliminar permanentemente al suscriptor ${email}?`)) {
      try {
        await deleteSubscriber(subscriberId).unwrap();
        showSuccess('Suscriptor eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting subscriber:', error);
        showError(error.data?.message || 'Error al eliminar suscriptor');
      }
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleExport = () => {
    // Crear enlace de descarga para CSV
    const link = document.createElement('a');
    link.href = '/api/subscribers/export';
    link.download = 'suscriptores_activos.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-64">
      <Loading text="Cargando suscriptores..." />
    </div>
  );

  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-600">Error al cargar suscriptores: {error.message}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Reintentar
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4">
            Suscriptores
            <span className="block text-sm font-normal text-gray-500 mt-2 tracking-wider uppercase">
              — Gestión del newsletter
            </span>
          </h1>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={handleExport} 
            variant="outline"
            className="flex items-center"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Activos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.activeSubscribers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalSubscribers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center">
              <span className="text-yellow-600 font-semibold">30d</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Últimos 30 días</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.recentSubscribers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
              <span className="text-red-600 font-semibold">%</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tasa de retención</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.conversionRate || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por email o nombre..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="">Todos</option>
            </select>
          </div>

          <Button onClick={handleSearch}>
            Buscar
          </Button>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {subscribers.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-500 text-lg font-light mt-4">
              {search ? 'No se encontraron suscriptores' : 'No hay suscriptores registrados'}
            </p>
            {search && (
              <Button 
                onClick={() => {
                  setSearch('');
                  setSearchInput('');
                  setPage(1);
                }} 
                variant="outline"
                className="mt-4"
              >
                Limpiar búsqueda
              </Button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {subscribers.map((subscriber) => (
              <li key={subscriber.id}>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        subscriber.isActive 
                          ? 'bg-gradient-to-br from-green-400 to-green-600' 
                          : 'bg-gradient-to-br from-gray-400 to-gray-600'
                      }`}>
                        <span className="text-lg font-light text-white">
                          {(subscriber.name || subscriber.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-lg font-light text-gray-900">
                        {subscriber.name || 'Sin nombre'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subscriber.email}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          subscriber.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subscriber.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        <span>Suscrito: {formatDate(subscriber.subscribedAt)}</span>
                        {subscriber.unsubscribedAt && (
                          <span className="ml-4">
                            Cancelado: {formatDate(subscriber.unsubscribedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteSubscriber(subscriber.id, subscriber.email)}
                      className="px-3 py-2"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              variant="outline"
            >
              Anterior
            </Button>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.total_pages}
              variant="outline"
            >
              Siguiente
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{((page - 1) * 50) + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(page * 50, pagination.total_items)}
                </span> de{' '}
                <span className="font-medium">{pagination.total_items}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  {page} de {pagination.total_pages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.total_pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscribersPage;