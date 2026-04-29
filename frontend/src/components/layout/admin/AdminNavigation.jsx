import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  SquaresPlusIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  CameraIcon,
  BuildingStorefrontIcon,
  Bars3Icon,
  XMarkIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const AdminNavigation = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Web',
      path: '/',
      icon: GlobeAltIcon,
      description: 'Ir al sitio público',
      isExternal: true
    },
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: HomeIcon,
    },
    {
      name: 'Salón de Ventas',
      path: '/admin/showroom',
      icon: BuildingStorefrontIcon,
      description: 'Categorías, Subcategorías y Productos'
    },
    {
      name: 'Usuarios',
      path: '/admin/users',
      icon: UsersIcon,
    },
    {
      name: 'Proyectos',
      path: '/admin/proyectosEdit',
      icon: CameraIcon,
    },
    {
      name: 'Blog',
      path: '/admin/blog',
      icon: DocumentTextIcon,
    },
    {
      name: 'Suscriptores',
      path: '/admin/subscribers',
      icon: EnvelopeIcon,
    },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Mobile Navigation Title */}
          <div className="flex md:hidden items-center">
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex">
            <div className="flex space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path === '/admin/showroom' && location.pathname.startsWith('/admin/showroom'));
                
                // Si es un link externo, usar <a> en lugar de NavLink
                if (item.isExternal) {
                  return (
                    <a
                      key={item.name}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      title={item.description}
                    >
                      <Icon className="w-5 h-5 mr-2" />
                      {item.name}
                    </a>
                  );
                }
                
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    title={item.description}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {item.name}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú principal</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path === '/admin/showroom' && location.pathname.startsWith('/admin/showroom'));
              
              // Si es un link externo, usar <a> en lugar de NavLink
              if (item.isExternal) {
                return (
                  <a
                    key={item.name}
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  >
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 mr-3" />
                      <div>
                        <div>{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                        )}
                      </div>
                    </div>
                  </a>
                );
              }
              
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)} // Cerrar menú al navegar
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3" />
                    <div>
                      <div>{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                      )}
                    </div>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavigation;
