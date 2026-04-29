import { useState } from 'react';
import { useGetCategoriesQuery } from '../../../features/categories/categoriesApi';
import { useGetSubcategoriesQuery } from '../../../features/subcategories/subcategoriesApi';
import { useProducts } from '../../../features/products/useProducts';

import CategoryManagement from './CategoryManagement';
import SubcategoryManagement from './SubcategoryManagement';
import ProductManagement from '../products/ProductManagement';
import AllProductsManagement from '../products/AllProductsManagement';

const ShowroomAdminPage = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const { data: categoriesData, isLoading: loadingCategories } = useGetCategoriesQuery({ limit: 100 });
  const { data: subcategoriesData, refetch: refetchSubcategories } = useGetSubcategoriesQuery(
    selectedCategory ? { categoryId: selectedCategory.id, limit: 100, active: false } : { limit: 100, active: false }
  );

  // Productos filtrados por subcategoría (para la vista por categorías)
  const { products, isLoading: loadingProducts, refetch: refetchProducts } = useProducts({
    subcategoryId: selectedSubcategory?.id,
    limit: 20
  });

  // Todos los productos (para la vista general)
  const { products: allProducts, isLoading: loadingAllProducts, refetch: refetchAllProducts } = useProducts({
    limit: 100
  });

  // Debug temporal - remover después
  console.log('ShowroomAdminPage - products from useProducts:', products);
  console.log('ShowroomAdminPage - selectedSubcategory:', selectedSubcategory);

  const categories = categoriesData?.data || [];
  const subcategories = subcategoriesData?.data || [];

  const tabs = [
    { 
      id: 'all-products', 
      label: 'Todos los Productos', 
      shortLabel: 'Todos',
      icon: '📦' 
    },
    { 
      id: 'categories', 
      label: 'Categorías', 
      shortLabel: 'Categorías',
      icon: '📁' 
    },
    { 
      id: 'subcategories', 
      label: 'Subcategorías', 
      shortLabel: 'Subcategorías',
      icon: '📂' 
    },
    { 
      id: 'products', 
      label: 'Productos por Categoría', 
      shortLabel: 'Por Categoría',
      icon: '🏷️' 
    }
  ];

  const getTabCounts = () => {
    return {
      'all-products': allProducts.length,
      categories: categories.length,
      subcategories: subcategories.length,
      products: products.length
    };
  };

  const counts = getTabCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Administración del Salón de Ventas
                </h1>
                <p className="mt-2 text-gray-600">
                  Gestiona categorías, subcategorías y productos de tu Salón de Ventas
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="hidden md:flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{counts['all-products']}</div>
                  <div className="text-sm text-gray-600">Productos Totales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{counts.categories}</div>
                  <div className="text-sm text-gray-600">Categorías</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{counts.subcategories}</div>
                  <div className="text-sm text-gray-600">Subcategorías</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 sm:space-x-4 md:space-x-8 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex items-center ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-1 sm:mr-2">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {counts[tab.id]}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSubcategory(null);
                setActiveTab('categories');
              }}
              className="hover:text-gray-900 transition-colors"
            >
              Categorías
            </button>
            
            {selectedCategory && (
              <>
                <span>→</span>
                <button
                  onClick={() => {
                    setSelectedSubcategory(null);
                    setActiveTab('subcategories');
                  }}
                  className="hover:text-gray-900 transition-colors"
                >
                  {selectedCategory.name}
                </button>
              </>
            )}
            
            {selectedSubcategory && (
              <>
                <span>→</span>
                <button
                  onClick={() => setActiveTab('products')}
                  className="hover:text-gray-900 transition-colors"
                >
                  {selectedSubcategory.name}
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'all-products' && (
          <AllProductsManagement
            products={allProducts}
            isLoading={loadingAllProducts}
            onRefresh={refetchAllProducts}
          />
        )}

        {activeTab === 'categories' && (
          <CategoryManagement
            categories={categories}
            isLoading={loadingCategories}
            onSelectCategory={(category) => {
              setSelectedCategory(category);
              setActiveTab('subcategories');
            }}
          />
        )}

        {activeTab === 'subcategories' && (
          <SubcategoryManagement
            category={selectedCategory}
            subcategories={subcategories}
            onSelectSubcategory={(subcategory) => {
              setSelectedSubcategory(subcategory);
              setActiveTab('products');
            }}
            onBackToCategories={() => {
              setSelectedCategory(null);
              setActiveTab('categories');
            }}
            onRefresh={refetchSubcategories}
          />
        )}

        {activeTab === 'products' && (
          <ProductManagement
            subcategory={selectedSubcategory}
            products={products}
            isLoading={loadingProducts}
            onRefresh={refetchProducts}
            onBackToSubcategories={() => {
              setSelectedSubcategory(null);
              setActiveTab('subcategories');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ShowroomAdminPage;
