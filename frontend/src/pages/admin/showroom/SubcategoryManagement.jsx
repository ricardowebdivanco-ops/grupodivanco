import { useState } from 'react';
import { 
  useCreateSubcategoryMutation, 
  useUpdateSubcategoryMutation, 
  useDeleteSubcategoryMutation,
  useUploadSubcategoryImageMutation 
} from '../../../features/subcategories/subcategoriesApi';

const SubcategoryManagement = ({ 
  category, 
  subcategories, 
  onSelectSubcategory, 
  onBackToCategories,
  onRefresh 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [createSubcategory, { isLoading: isCreating }] = useCreateSubcategoryMutation();
  const [updateSubcategory, { isLoading: isUpdating }] = useUpdateSubcategoryMutation();
  const [deleteSubcategory, { isLoading: isDeleting }] = useDeleteSubcategoryMutation();

  const filteredSubcategories = subcategories.filter(subcategory =>
    subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subcategory.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (subcategory) => {
    setEditingSubcategory(subcategory);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingSubcategory(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSubcategory(null);
  };

  const handleDelete = async (subcategory) => {
    const confirmMessage = subcategory.isActive 
      ? `¿Qué acción quieres realizar con "${subcategory.name}"?`
      : `¿Qué acción quieres realizar con "${subcategory.name}" (actualmente inactiva)?`;
    
    // Crear un modal personalizado para las opciones
    const choice = await showDeleteOptions(subcategory);
    
    if (choice === 'soft') {
      try {
        await deleteSubcategory({ slug: subcategory.slug, permanent: false }).unwrap();
        if (onRefresh) {
          await onRefresh();
        }
      } catch (error) {
        alert('Error al eliminar la subcategoría: ' + (error.data?.message || error.message));
      }
    } else if (choice === 'hard') {
      try {
        await deleteSubcategory({ slug: subcategory.slug, permanent: true }).unwrap();
        if (onRefresh) {
          await onRefresh();
        }
      } catch (error) {
        alert('Error al eliminar permanentemente la subcategoría: ' + (error.data?.message || error.message));
      }
    }
  };

  const showDeleteOptions = (subcategory) => {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 class="text-lg font-semibold mb-4">Eliminar "${subcategory.name}"</h3>
          <p class="text-gray-600 mb-6">¿Qué tipo de eliminación deseas realizar?</p>
          <div class="flex flex-col gap-3">
            ${subcategory.isActive ? `
              <button id="soft-delete" class="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                Desactivar (Eliminación suave)
              </button>
            ` : ''}
            <button id="hard-delete" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Eliminar permanentemente
            </button>
            <button id="cancel" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">
              Cancelar
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const cleanup = () => {
        document.body.removeChild(modal);
      };

      modal.querySelector('#soft-delete')?.addEventListener('click', () => {
        cleanup();
        resolve('soft');
      });

      modal.querySelector('#hard-delete').addEventListener('click', () => {
        if (confirm('⚠️ Esta acción NO se puede deshacer. ¿Estás completamente seguro?')) {
          cleanup();
          resolve('hard');
        }
      });

      modal.querySelector('#cancel').addEventListener('click', () => {
        cleanup();
        resolve('cancel');
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          cleanup();
          resolve('cancel');
        }
      });
    });
  };

  const handleRestore = async (subcategory) => {
    if (window.confirm(`¿Quieres restaurar la subcategoría "${subcategory.name}"?`)) {
      try {
        await updateSubcategory({
          slug: subcategory.slug,
          isActive: true
        }).unwrap();
        // Refrescar la lista después de restaurar
        if (onRefresh) {
          await onRefresh();
        }
      } catch (error) {
        alert('Error al restaurar la subcategoría: ' + (error.data?.message || error.message));
      }
    }
  };

  if (!category) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Selecciona una categoría
        </h3>
        <p className="text-gray-600 mb-4">
          Primero debes seleccionar una categoría para gestionar sus subcategorías
        </p>
        <button
          onClick={onBackToCategories}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          Ver categorías
        </button>
      </div>
    );
  }

  if (showForm) {
    return (
      <SubcategoryForm
        category={category}
        subcategory={editingSubcategory}
        onClose={handleCloseForm}
        onSave={handleCloseForm}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={onBackToCategories}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              Subcategorías de {category.name}
            </h2>
          </div>
          <p className="text-gray-600">
            Gestiona las subcategorías que pertenecen a esta categoría
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Subcategoría
        </button>
      </div>

      {/* Category Info */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          {category.featuredImage?.desktop?.url || category.featuredImage?.thumbnail?.url ? (
            <img
              src={category.featuredImage.desktop?.url || category.featuredImage.thumbnail?.url}
              alt={category.name}
              className="w-12 h-12 object-cover rounded-lg"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-gray-600">{category.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar subcategorías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Subcategories Grid */}
      {filteredSubcategories.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron subcategorías' : 'No hay subcategorías'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Intenta buscar con otros términos' 
              : `Comienza creando la primera subcategoría para ${category.name}`
            }
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreate}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Crear primera subcategoría
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubcategories.map((subcategory) => (
            <div key={subcategory.id} className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${!subcategory.isActive ? 'opacity-60' : ''}`}>
              {/* Image */}
              <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                {subcategory.featuredImage?.desktop?.url || subcategory.featuredImage?.thumbnail?.url ? (
                  <img
                    src={subcategory.featuredImage.desktop?.url || subcategory.featuredImage.thumbnail?.url}
                    alt={subcategory.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 flex-1">
                    {subcategory.name}
                  </h3>
                  <div className="flex items-center gap-1 ml-2">
                    {!subcategory.isActive && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Inactiva
                      </span>
                    )}
                    {subcategory.isShowInHome && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Home
                      </span>
                    )}
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      #{subcategory.order}
                    </span>
                  </div>
                </div>

                {subcategory.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {subcategory.description}
                  </p>
                )}

                <div className="text-xs text-gray-500 mb-4">
                  <span className="font-medium">Slug:</span> {subcategory.slug}
                </div>

                {/* Products count */}
                {subcategory.productCount !== undefined && (
                  <div className="text-xs text-gray-500 mb-4">
                    <span className="font-medium">Productos:</span> {subcategory.productCount}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onSelectSubcategory(subcategory)}
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors flex items-center gap-1"
                  >
                    Ver productos
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(subcategory)}
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {subcategory.isActive ? (
                      <button
                        onClick={() => handleDelete(subcategory)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Eliminar"
                        disabled={isDeleting}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestore(subcategory)}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Restaurar"
                        disabled={isUpdating}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente de formulario para subcategorías
const SubcategoryForm = ({ category, subcategory, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: subcategory?.name || '',
    description: subcategory?.description || '',
    content: subcategory?.content || '',
    order: subcategory?.order || 0,
    isShowInHome: subcategory?.isShowInHome || false,
    slug: subcategory?.slug || ''
  });
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(() => {
    // Only set image preview from subcategory data if subcategory exists
    if (subcategory?.featuredImage) {
      return subcategory.featuredImage.desktop?.url || 
             subcategory.featuredImage.thumbnail?.url || 
             null;
    }
    return null;
  });

  const [createSubcategory, { isLoading: isCreating }] = useCreateSubcategoryMutation();
  const [updateSubcategory, { isLoading: isUpdating }] = useUpdateSubcategoryMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadSubcategoryImageMutation();

  // Auto-generate slug from name
  const generateSlug = (name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => {
      const newForm = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Auto-generate slug when name changes
      if (name === 'name') {
        newForm.slug = generateSlug(value);
      }
      
      return newForm;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (!form.slug.trim()) {
      setError('El slug es obligatorio');
      return;
    }

    try {
      // Clean form data to prevent console logs from being submitted
      const cleanForm = {
        ...form,
        // Clean and limit content field to prevent validation errors
        description: form.description?.substring(0, 990) || '',
        content: form.content?.substring(0, 2990) || ''
      };
      
      console.log('🔵 [SubcategoryForm] Enviando datos de subcategoría:', {
        ...cleanForm, 
        categoryId: category.id
      });
      
      let savedSubcategory;
      const payload = { ...cleanForm, categoryId: category.id };
      
      if (subcategory) {
        console.log('🔵 [SubcategoryForm] Actualizando subcategoría existente ID:', subcategory.id);
        savedSubcategory = await updateSubcategory({ id: subcategory.id, ...payload }).unwrap();
      } else {
        console.log('🔵 [SubcategoryForm] Creando nueva subcategoría');
        savedSubcategory = await createSubcategory(payload).unwrap();
      }

      console.log('✅ [SubcategoryForm] Subcategoría guardada exitosamente:', savedSubcategory);

      // Upload image if selected
      if (imageFile && savedSubcategory) {
        console.log('🔵 [SubcategoryForm] Preparando subida de imagen');
        const formData = new FormData();
        formData.append('image', imageFile);
        
        // Obtener el slug de la subcategoría (puede venir de la respuesta o usar el existente)
        const targetSlug = savedSubcategory.data?.slug || savedSubcategory.slug || subcategory?.slug || form.slug;
        console.log('🔵 [SubcategoryForm] Subiendo imagen para slug:', targetSlug);
        
        try {
          const imageResult = await uploadImage({ 
            slug: targetSlug, 
            formData 
          }).unwrap();
          console.log('✅ [SubcategoryForm] Imagen subida exitosamente:', imageResult);
        } catch (imageError) {
          console.error('🔴 [SubcategoryForm] Error al subir imagen:', imageError);
          // Continue despite image upload error
        }
      }
      
      // Refrescar los datos y cerrar el formulario
      if (onSave) {
        onSave();
      }
      
      // Resetear el formulario si es una nueva subcategoría
      if (!subcategory) {
        setForm({
          name: '',
          slug: '',
          description: '',
          content: '',
          order: 0,
          isShowInHome: false
        });
        setImageFile(null);
        setImagePreview(null);
      }
    } catch (err) {
      console.error('🔴 [SubcategoryForm] Error al guardar:', err);
      
      // Handle validation errors from backend
      if (err?.data?.errors && Array.isArray(err.data.errors)) {
        setError(`Error de validación: ${err.data.errors.join(', ')}`);
      } else if (err?.data?.message) {
        setError(err.data.message);
      } else {
        setError('Error al guardar la subcategoría. Por favor intenta de nuevo.');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {subcategory ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
            </h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            En categoría: <span className="font-medium">{category.name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                URL amigable (se genera automáticamente)
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Contenido adicional para la subcategoría..."
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orden
              </label>
              <input
                type="number"
                name="order"
                value={form.order}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                name="isShowInHome"
                checked={form.isShowInHome}
                onChange={handleChange}
                id="isShowInHome"
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="isShowInHome" className="ml-2 text-sm text-gray-700">
                Mostrar en página de inicio
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen destacada
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-24 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating || isUploading}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating || isUpdating || isUploading 
                ? 'Guardando...' 
                : subcategory ? 'Guardar cambios' : 'Crear subcategoría'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubcategoryManagement;
