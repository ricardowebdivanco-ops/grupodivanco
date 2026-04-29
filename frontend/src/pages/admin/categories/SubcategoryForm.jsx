import React, { useState, useEffect, useRef } from 'react';
import { useCreateSubcategoryMutation, useUpdateSubcategoryMutation, useUploadSubcategoryImageMutation } from '../../../features/subcategories/subcategoriesApi';

const initialState = {
  name: '',
  description: '',
  brand: '',
  model: '',
  sku: '',
  specifications: '', // JSON string
  content: '',
  order: 0,
  isFeatured: false,
  isNew: false,
  slug: '',
};

const generateSlug = (name) => {
  if (!name) return '';
  return name.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
};

const SubcategoryForm = ({ category, subcategory, onClose }) => {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState(null);
  const [createSubcategory, { isLoading: isCreating }] = useCreateSubcategoryMutation();
  const [updateSubcategory, { isLoading: isUpdating }] = useUpdateSubcategoryMutation();
  const [uploadSubcategoryImage, { isLoading: isUploading }] = useUploadSubcategoryImageMutation();
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    if (subcategory) {
      setForm({
        name: subcategory.name || '',
        description: subcategory.description || '',
        brand: subcategory.brand || '',
        model: subcategory.model || '',
        sku: subcategory.sku || '',
        specifications: subcategory.specifications ? JSON.stringify(subcategory.specifications, null, 2) : '',
        content: subcategory.content || '',
        order: subcategory.order || 0,
        isFeatured: subcategory.isFeatured || false,
        isNew: subcategory.isNew || false,
        slug: subcategory.slug || '',
      });
      setImagePreview(subcategory.featuredImage?.md || null);
    } else {
      setForm({ ...initialState, slug: '' });
      setImagePreview(null);
    }
    setError(null);
    setImageFile(null);
  }, [subcategory]);

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
    if (!subcategory || !imageFile) return;
    const formData = new FormData();
    formData.append('image', imageFile);
    try {
      await uploadSubcategoryImage({ slug: subcategory.slug, formData }).unwrap();
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err?.data?.message || 'Error al subir la imagen');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Forzar generación de slug justo antes de enviar
    const nameForSlug = form.name || '';
    const slug = generateSlug(nameForSlug);
    if (!form.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!slug) {
      setError('El slug no puede estar vacío');
      return;
    }
    let specsObj = undefined;
    if (form.specifications) {
      try {
        specsObj = JSON.parse(form.specifications);
      } catch {
        setError('Las especificaciones deben ser un JSON válido');
        return;
      }
    }
    try {
      let savedSubcategory = subcategory;
      // Limpiar el payload de valores null/undefined
      const payload = {
        ...form,
        slug, // aseguramos que el slug nunca sea null ni vacío
        specifications: specsObj,
        categoryId: category.id,
      };
      // Eliminar claves con valor null o undefined
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });
      console.log('Datos a enviar (subcategoría):', payload);
      if (subcategory) {
        await updateSubcategory({ slug: subcategory.slug, ...payload }).unwrap();
      } else {
        savedSubcategory = await createSubcategory(payload).unwrap();
      }
      // Si hay imagen seleccionada y es edición o ya se creó la subcategoría
      if (imageFile && (subcategory || savedSubcategory)) {
        const slugToUpload = (subcategory?.slug || savedSubcategory?.slug);
        const formData = new FormData();
        formData.append('image', imageFile);
        await uploadSubcategoryImage({ slug: slugToUpload, formData }).unwrap();
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      onClose();
    } catch (err) {
      setError(err?.data?.message || 'Error al guardar la subcategoría');
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4 max-w-md">
      <h2 className="text-lg font-semibold mb-2">{subcategory ? 'Editar Item' : 'Crear Item'}</h2>
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
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium">Marca</label>
            <input
              type="text"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Modelo</label>
            <input
              type="text"
              name="model"
              value={form.model}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">SKU</label>
          <input
            type="text"
            name="sku"
            value={form.sku}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Especificaciones (JSON)</label>
          <textarea
            name="specifications"
            value={form.specifications}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 font-mono"
            rows={2}
            placeholder='{"dimensions": "60x60cm", "thickness": "9mm"}'
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
            name="isFeatured"
            checked={form.isFeatured}
            onChange={handleChange}
            id="isFeatured"
          />
          <label htmlFor="isFeatured" className="text-sm">Destacado</label>
          <input
            type="checkbox"
            name="isNew"
            checked={form.isNew}
            onChange={handleChange}
            id="isNew"
          />
          <label htmlFor="isNew" className="text-sm">Nuevo</label>
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
          {subcategory && imageFile && (
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
            {subcategory ? 'Guardar cambios' : 'Crear Item'}
          </button>
          <button type="button" className="text-naranjaDivanco" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default SubcategoryForm;
