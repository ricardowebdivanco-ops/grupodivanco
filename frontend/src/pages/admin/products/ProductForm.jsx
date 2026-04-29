import { useState, useRef } from 'react';
import { useProductManager } from '../../../features/products/useProducts';

const ProductForm = ({ subcategory, product, onClose, onSave }) => {
  // Estado local para el producto actual (para manejar actualizaciones en tiempo real)
  const [currentProduct, setCurrentProduct] = useState(product);

  const [form, setForm] = useState({
    name: currentProduct?.name || '',
    description: currentProduct?.description || '',
    shortDescription: currentProduct?.shortDescription || '',
    brand: currentProduct?.brand || '',
    model: currentProduct?.model || '',
    price: currentProduct?.price || '',
    salePrice: currentProduct?.salePrice || '',
    stock: currentProduct?.stock || 0,
    specifications: currentProduct?.specifications || {},
    dimensions: currentProduct?.specifications?.dimensions || {},
    order: currentProduct?.order || 0,
    isFeatured: currentProduct?.isFeatured ?? false,
    isNew: currentProduct?.isNew ?? false,
    isOnSale: currentProduct?.isOnSale ?? false,
    slug: currentProduct?.slug || ''
  });

  const [specifications, setSpecifications] = useState(
    Object.entries(currentProduct?.specifications || {}).map(([key, value]) => ({ key, value }))
  );
  const [dimensions, setDimensions] = useState(
    Object.entries(currentProduct?.specifications?.dimensions || {}).map(([key, value]) => ({ key, value }))
  );

  const [error, setError] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef();

  const {
    createProduct,
    updateProduct,
    uploadImage,
    deleteImage,
    isCreating,
    isUpdating,
    isUploading
  } = useProductManager();

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
      
      // Auto-set isOnSale when salePrice is added/removed
      if (name === 'salePrice') {
        newForm.isOnSale = value && parseFloat(value) > 0;
      }
      
      return newForm;
    });
  };

  const handleSpecificationChange = (index, field, value) => {
    const newSpecifications = [...specifications];
    newSpecifications[index] = { ...newSpecifications[index], [field]: value };
    setSpecifications(newSpecifications);
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const removeSpecification = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleDimensionChange = (index, field, value) => {
    const newDimensions = [...dimensions];
    newDimensions[index] = { ...newDimensions[index], [field]: value };
    setDimensions(newDimensions);
  };

  const addDimension = () => {
    setDimensions([...dimensions, { key: '', value: '' }]);
  };

  const removeDimension = (index) => {
    setDimensions(dimensions.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    // Mantener las imágenes ya seleccionadas y agregar las nuevas
    setSelectedImages(prevImages => [...prevImages, ...files]);
  };

  const handleImageUpload = async (productId) => {
    console.log('🔵 [ProductForm] handleImageUpload iniciado:', {
      productId,
      selectedImagesCount: selectedImages.length,
      selectedImages: selectedImages.map(f => ({ name: f.name, size: f.size }))
    });
    
    if (selectedImages.length === 0) {
      console.log('⚠️ [ProductForm] No hay imágenes para subir');
      return;
    }

    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i];
      console.log(`🔵 [ProductForm] Subiendo imagen ${i + 1}/${selectedImages.length}:`, file.name);
      setUploadProgress(prev => ({ ...prev, [i]: 0 }));

      try {
        const result = await uploadImage(productId, [file]);
        console.log(`✅ [ProductForm] Imagen ${i + 1} subida exitosamente:`, result);
        setUploadProgress(prev => ({ ...prev, [i]: 100 }));
      } catch (error) {
        console.error(`🔴 [ProductForm] Error subiendo imagen ${i + 1}:`, error);
        setUploadProgress(prev => ({ ...prev, [i]: -1 }));
      }
    }

    // Clear selected images after upload
    console.log('🔵 [ProductForm] Limpiando imágenes seleccionadas');
    setSelectedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (imageIndex) => {
    if (!currentProduct || !window.confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return;
    }

    try {
      await deleteImage(currentProduct.id, imageIndex);

      // Actualizar el estado local removiendo la imagen eliminada
      setCurrentProduct(prevProduct => ({
        ...prevProduct,
        images: prevProduct.images.filter((_, index) => index !== imageIndex)
      }));

    } catch (error) {
      alert('Error al eliminar la imagen: ' + error.message);
    }
  };

  const handleMoveImage = (fromIndex, toIndex) => {
    if (!currentProduct || !currentProduct.images) return;
    
    const newImages = [...currentProduct.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    
    setCurrentProduct(prevProduct => ({
      ...prevProduct,
      images: newImages
    }));
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
      // Convert specifications and dimensions arrays to objects
      const specificationsObj = specifications.reduce((acc, spec) => {
        const key = typeof spec.key === 'string' ? spec.key.trim() : '';
        const value = typeof spec.value === 'string' ? spec.value.trim() : '';
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const dimensionsObj = dimensions.reduce((acc, dim) => {
        const key = typeof dim.key === 'string' ? dim.key.trim() : '';
        const value = typeof dim.value === 'string' ? dim.value.trim() : '';
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const payload = {
        name: form.name,
        description: form.description,
        shortDescription: form.shortDescription,
        brand: form.brand,
        model: form.model,
        slug: form.slug,
        price: form.price ? parseFloat(form.price) : null,
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        stock: form.stock ? parseInt(form.stock) : 0,
        order: form.order ? parseInt(form.order) : 0,
        isFeatured: Boolean(form.isFeatured),
        isNew: Boolean(form.isNew),
        isOnSale: Boolean(form.isOnSale),
        subcategoryId: subcategory.id,
        currency: 'COP',
        specifications: {
          ...specificationsObj,
          dimensions: dimensionsObj
        }
      };

      console.log('🔵 [ProductForm] Enviando datos:', payload);
      let result;
      
      if (product) {
        console.log('🔵 [ProductForm] Actualizando producto existente ID:', product.id);
        result = await updateProduct(product.id, payload);
      } else {
        console.log('🔵 [ProductForm] Creando nuevo producto');
        result = await createProduct(payload);
      }

      if (!result.success) {
        console.error('🔴 [ProductForm] Error al guardar:', result.error);
        setError(result.error);
        return;
      }

      console.log('✅ [ProductForm] Producto guardado exitosamente:', result.data);
      console.log('🔍 [ProductForm] Debug - result completo:', result);
      console.log('🔍 [ProductForm] Debug - result.data:', result.data);
      console.log('🔍 [ProductForm] Debug - result.data.product:', result.data?.product);
      console.log('🔍 [ProductForm] Debug - result.data.product.id:', result.data?.product?.id);

      // Upload images if selected
      const productId = result.data?.data?.product?.id || product?.id;
      console.log('🔍 [ProductForm] ProductId extraído:', productId);
      console.log('🔍 [ProductForm] Imágenes seleccionadas:', selectedImages.length);
      
      if (selectedImages.length > 0 && productId) {
        console.log('🔵 [ProductForm] Iniciando subida de imágenes para producto:', productId);
        await handleImageUpload(productId);
      } else {
        console.log('⚠️ [ProductForm] No se subirán imágenes:', {
          hasImages: selectedImages.length > 0,
          hasProductId: !!productId,
          productId,
          selectedImagesCount: selectedImages.length
        });
      }

      // Reiniciar el formulario si es un nuevo producto
      if (!product) {
        setForm({
          name: '',
          description: '',
          shortDescription: '', // Agregamos la descripción corta
          brand: '',
          model: '',
          price: '',
          salePrice: '',
          stock: 0,
          specifications: {},
          dimensions: {},
          order: 0,
          featured: false,
          isNew: false,
          isOnSale: false,
          slug: ''
        });
        setSpecifications([]);
        setDimensions([]);
        setSelectedImages([]);
        setUploadProgress({});
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }

      onSave();
    } catch (err) {
      setError(err?.message || 'Error al guardar el producto');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {product ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Subcategoría: <span className="font-medium">{subcategory.name}</span>
            {subcategory.category && (
              <span> • Categoría: <span className="font-medium">{subcategory.category.name}</span></span>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Información básica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del producto *
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
                Descripción corta
              </label>
              <input
                type="text"
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Descripción breve que aparecerá sobre la imagen en ProjectSection"
              />
              <p className="text-xs text-gray-500 mt-1">
                Esta descripción corta se mostrará sobre la imagen en la sección de proyectos.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Descripción detallada del producto..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo
                </label>
                <input
                  type="text"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Precios</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio regular (COP)
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  step="100"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="$ 0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de oferta (COP)
                </label>
                <input
                  type="number"
                  name="salePrice"
                  value={form.salePrice}
                  onChange={handleChange}
                  step="100"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="$ 0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deja vacío si no hay oferta
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock disponible
                </label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  step="1"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0 unidades"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cantidad de unidades disponibles
                </p>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Especificaciones</h3>
              <button
                type="button"
                onClick={addSpecification}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                + Añadir especificación
              </button>
            </div>
            
            {specifications.map((spec, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Propiedad
                  </label>
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                    placeholder="ej. Material, Color, Tamaño..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                      placeholder="ej. Madera, Rojo, Grande..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dimensions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Dimensiones</h3>
              <button
                type="button"
                onClick={addDimension}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                + Añadir dimensión
              </button>
            </div>
            
            {dimensions.map((dim, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medida
                  </label>
                  <input
                    type="text"
                    value={dim.key}
                    onChange={(e) => handleDimensionChange(index, 'key', e.target.value)}
                    placeholder="ej. Alto, Ancho, Profundidad..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={dim.value}
                      onChange={(e) => handleDimensionChange(index, 'value', e.target.value)}
                      placeholder="ej. 180cm, 90cm, 45cm..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeDimension(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Settings */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configuración</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orden de visualización
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

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                    id="isFeatured"
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">
                    Producto destacado
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isNew"
                    checked={form.isNew}
                    onChange={handleChange}
                    id="isNew"
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="isNew" className="ml-2 text-sm text-gray-700">
                    Producto nuevo
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isOnSale"
                    checked={form.isOnSale}
                    onChange={handleChange}
                    id="isOnSale"
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="isOnSale" className="ml-2 text-sm text-gray-700">
                    En oferta
                  </label>
                </div>
              </div>

              {/* Mostrar siempre el estado de stock */}
              <div>
                {(
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      form.stock > 10 ? 'bg-green-500' : 
                      form.stock > 0 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}></div>
                    <span className="text-sm text-gray-700">
                      Stock: {form.stock} {form.stock === 1 ? 'unidad' : 'unidades'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Imágenes</h3>
            
            {/* Current images */}
            {currentProduct && currentProduct.images && currentProduct.images.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Imágenes actuales</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentProduct.images.map((image, index) => {
                    // Extract URL from the complex image structure
                    const imageUrl = image?.thumbnail?.url || image?.desktop?.url || image?.mobile?.url || image?.url;
                    return (
                      <div key={index} className="relative group">
                        <div className="absolute top-1 left-1 bg-gray-800 text-white px-2 py-0.5 rounded text-xs font-medium">
                          #{index + 1}
                        </div>
                        <img
                          src={imageUrl}
                          alt={`${currentProduct.name} ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        {/* Reorder buttons */}
                        <div className="absolute bottom-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(index, index - 1)}
                              className="bg-blue-600 text-white rounded p-1 hover:bg-blue-700"
                              title="Mover a la izquierda"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                          )}
                          {index < currentProduct.images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(index, index + 1)}
                              className="bg-blue-600 text-white rounded p-1 hover:bg-blue-700"
                              title="Mover a la derecha"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                        </div>
                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Usa las flechas para cambiar el orden de las imágenes
                </p>
              </div>
            )}

            {/* Upload new images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {currentProduct ? 'Añadir nuevas imágenes' : 'Subir imágenes'}
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Puedes seleccionar múltiples imágenes. Se subirán después de guardar el producto.
              </p>
              
              {selectedImages.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-700 mb-2">
                    {selectedImages.length} imagen(es) seleccionada(s)
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-16 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = [...selectedImages];
                            newImages.splice(index, 1);
                            setSelectedImages(newImages);
                          }}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        {uploadProgress[index] !== undefined && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                            {uploadProgress[index] === -1 ? (
                              <span className="text-red-400 text-xs">Error</span>
                            ) : uploadProgress[index] === 100 ? (
                              <span className="text-green-400 text-xs">✓</span>
                            ) : (
                              <span className="text-white text-xs">{uploadProgress[index]}%</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
              onClick={handleClose}
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
                : product ? 'Guardar cambios' : 'Crear producto'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
