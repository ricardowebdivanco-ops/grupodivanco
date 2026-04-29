import React, { useState } from 'react';
import CategoryList from './CategoryList';
import CategoryForm from './CategoryForm';
import SubcategoryList from './SubcategoryList';
import SubcategoryForm from './SubcategoryForm';

const CategoryAdminPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Categorías y Productos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <CategoryList 
            onSelect={setSelectedCategory} 
            onCreate={() => { setShowCategoryForm(true); setSelectedCategory(null); }}
            onEdit={(cat) => { setShowCategoryForm(true); setSelectedCategory(cat); }}
          />
          {showCategoryForm && (
            <CategoryForm 
              category={selectedCategory} 
              onClose={() => setShowCategoryForm(false)} 
            />
          )}
        </div>
        <div>
          {selectedCategory && (
            <>
              <SubcategoryList 
                category={selectedCategory} 
                onEdit={(sub) => { setShowSubcategoryForm(true); setSelectedSubcategory(sub); }}
              />
              <button 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" 
                onClick={() => { setShowSubcategoryForm(true); setSelectedSubcategory(null); }}
              >
                Crear Item
              </button>
              {showSubcategoryForm && (
                <SubcategoryForm 
                  category={selectedCategory} 
                  subcategory={selectedSubcategory} 
                  onClose={() => setShowSubcategoryForm(false)} 
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryAdminPage;
