import React, { useState, useEffect, useRef } from 'react';
import { 
  useCreateCategoryMutation, 
  useUpdateCategoryMutation, 
  useUploadCategoryImageMutation,
  useGetCategoriesQuery 
} from '../../../features/categories/categoriesApi';

const initialState = {
  name: '',
  description: '',
  content: '',
  order: 0,
  isShowInHome: false,
};


const CategoryForm = ({ category, onClose }) => {
  console.log('[CategoryForm] *** COMPONENTE INICIADO ***', { category, onClose });
  
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState(null);
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [uploadCategoryImage, { isLoading: isUploading }] = useUploadCategoryImageMutation();
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef();

  // Hook para refrescar la lista de categorías después de cambios
  const { refetch: refetchCategories, data: categoriesData } = useGetCategoriesQuery({ limit: 100 });

  // Log para debugging - verificar los datos que llegan
  useEffect(() => {
    if (categoriesData) {
      console.log('[CategoryForm] Datos de categorías recibidos:', categoriesData);
      console.log('[CategoryForm] Primera categoría:', categoriesData?.data?.[0]);
      const categoryWithImage = categoriesData?.data?.find(cat => cat.featuredImage);
      console.log('[CategoryForm] Categoría con imagen encontrada:', categoryWithImage);
    }
  }, [categoriesData]);


  // Generador de slug: "categoria-" + primera palabra del nombre (limpia)
  const generateSlug = (name) => {
    if (!name) return '';
    const firstWord = name.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    return `categoria-${firstWord}`;
  };

  useEffect(() => {
    console.log('[CategoryForm] useEffect ejecutado, categoría:', category);
    if (category) {
      console.log('[CategoryForm] Categoría tiene featuredImage:', category.featuredImage);
      setForm({
        name: category.name || '',
        description: category.description || '',
        content: category.content || '',
        order: category.order || 0,
        isShowInHome: category.isShowInHome || false,
        slug: category.slug || '',
      });
      const imageUrl = category.featuredImage?.thumbnail?.url || category.featuredImage?.desktop?.url || null;
      console.log('[CategoryForm] Estableciendo imagePreview a:', imageUrl);
      setImagePreview(imageUrl);
    } else {
      setForm({ ...initialState, slug: '' });
      setImagePreview(null);
    }
    setError(null);
    setImageFile(null);
  }, [category]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      if (name === 'name') {
        return {
          ...prev,
          name: value,
          slug: generateSlug(value),
        };
      }
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!category || !imageFile) return;
    const formData = new FormData();
    formData.append('image', imageFile);
    try {
      await uploadCategoryImage({ id: category.id, formData }).unwrap();
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err?.data?.message || 'Error al subir la imagen');
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    console.log('[CategoryForm] Iniciando submit del formulario');
    
    if (!form.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!form.slug || !form.slug.trim()) {
      setError('El slug no puede estar vacío');
      return;
    }
    
    try {
      console.log('[CategoryForm] Payload enviado:', form);
      let savedCategory = category;
      
      if (category) {
        console.log('[CategoryForm] Actualizando categoría existente...');
        await updateCategory({ id: category.id, ...form }).unwrap();
        console.log('[CategoryForm] Categoría actualizada exitosamente');
      } else {
        console.log('[CategoryForm] Creando nueva categoría...');
        savedCategory = await createCategory(form).unwrap();
        console.log('[CategoryForm] Categoría creada exitosamente:', savedCategory);
      }
      
      // Si hay imagen seleccionada y es edición o ya se creó la categoría
      if (imageFile && (category || savedCategory)) {
        const categoryId = category?.id || savedCategory?.data?.id;
        console.log('[CategoryForm] Datos para upload:', {
          category,
          savedCategory,
          categoryId,
          imageFile: imageFile?.name
        });
        
        if (!categoryId) {
          console.error('[CategoryForm] No se pudo obtener el ID de la categoría');
          setError('Error: No se pudo obtener el ID de la categoría para subir la imagen');
          return;
        }
        
        const formData = new FormData();
        formData.append('image', imageFile);
        
        console.log('[CategoryForm] Enviando imagen a ID:', categoryId);
        
        try {
          const uploadResult = await uploadCategoryImage({ id: categoryId, formData }).unwrap();
          console.log('[CategoryForm] Upload exitoso:', uploadResult);
          
          setImageFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          
          // Refrescar los datos para mostrar la imagen
          console.log('[CategoryForm] Refrescando lista de categorías...');
          const refreshResult = await refetchCategories();
          console.log('[CategoryForm] Lista refrescada exitosamente');
          console.log('[CategoryForm] Datos refrescados:', refreshResult);
          
          // Buscar la categoría actualizada en los datos refrescados
          if (refreshResult?.data?.data) {
            const updatedCategory = refreshResult.data.data.find(cat => cat.id === categoryId);
            console.log('[CategoryForm] Categoría actualizada encontrada:', updatedCategory);
            console.log('[CategoryForm] featuredImage de la categoría:', updatedCategory?.featuredImage);
            
            // Actualizar la vista previa con la nueva imagen
            if (updatedCategory?.featuredImage) {
              const newImageUrl = updatedCategory.featuredImage.thumbnail?.url || updatedCategory.featuredImage.desktop?.url;
              console.log('[CategoryForm] Actualizando vista previa con:', newImageUrl);
              setImagePreview(newImageUrl);
            }
          }
        } catch (uploadError) {
          console.error('[CategoryForm] Error subiendo imagen:', uploadError);
          setError('Error al subir la imagen: ' + (uploadError?.data?.message || uploadError.message));
          return;
        }
      } else {
        console.log('[CategoryForm] No hay imagen para subir o no se cumplieron las condiciones');
      }
      
      console.log('[CategoryForm] Proceso completado, cerrando formulario');
      onClose();
    } catch (err) {
      console.error('[CategoryForm] Error en handleSubmit:', err);
      setError(err?.data?.message || 'Error al guardar la categoría');
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4 max-w-md">
      <h2 className="text-lg font-semibold mb-2">{category ? 'Editar categoría' : 'Crear categoría'}</h2>
  <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input
            type="text"
            name="slug"
            value={form.slug || ''}
            readOnly
            className="w-full border rounded px-2 py-1 bg-gray-100 text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Nombre *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Descripción</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Contenido</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Orden</label>
          <input
            type="number"
            name="order"
            value={form.order}
            onChange={handleChange}
            className="w-24 border rounded px-2 py-1"
            min={0}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isShowInHome"
            checked={form.isShowInHome}
            onChange={handleChange}
            id="isShowInHome"
          />
          <label htmlFor="isShowInHome" className="text-sm">Mostrar en Home</label>
        </div>
        {/* Imagen destacada */}
        <div>
          <label className="block text-sm font-medium">Imagen destacada</label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="block mt-1"
            disabled={isUploading}
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="mt-2 h-24 rounded object-cover border" />
          )}
          {category && imageFile && (
            <button
              type="button"
              className="mt-2 px-3 py-1 bg-naranjaDivanco/10 text-naranjaDivanco rounded text-xs"
              onClick={handleImageUpload}
              disabled={isUploading}
            >
              {isUploading ? 'Subiendo...' : 'Subir imagen'}
            </button>
          )}
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            className="bg-naranjaDivanco text-white px-4 py-2 rounded disabled:opacity-60"
            disabled={isCreating || isUpdating}
          >
            {category ? 'Guardar cambios' : 'Crear categoría'}
          </button>
          <button type="button" className="text-naranjaDivanco" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
