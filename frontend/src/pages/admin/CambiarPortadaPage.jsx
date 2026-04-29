import { useState, useRef } from 'react';
import { useGetHeroImageQuery, useUpdateHeroImageMutation } from '../../../features/siteSettings/siteSettingsApi';
import toast from 'react-hot-toast';

const CambiarPortadaPage = () => {
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const { data, isLoading: isLoadingCurrent } = useGetHeroImageQuery();
  const [updateHeroImage, { isLoading: isUploading }] = useUpdateHeroImageMutation();

  const currentImageUrl = data?.data?.url;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Selecciona una imagen primero');
      return;
    }

    try {
      await updateHeroImage(selectedFile).unwrap();
      toast.success('Imagen de portada actualizada correctamente');
      setSelectedFile(null);
      setPreview(null);
    } catch {
      toast.error('Error al subir la imagen. Intenta de nuevo.');
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Imagen de portada</h1>
      <p className="text-sm text-gray-500 mb-8">
        Esta imagen se muestra en la sección hero de la página principal.
      </p>

      {/* Imagen actual */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Imagen actual</h2>
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
          {isLoadingCurrent ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt="Portada actual"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              Sin imagen configurada — se usa la imagen por defecto
            </div>
          )}
        </div>
      </div>

      {/* Upload zone */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Nueva imagen</h2>
        <div
          className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {preview ? (
            <div className="relative w-full aspect-video rounded overflow-hidden">
              <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
              <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                Vista previa
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-600">Haz clic o arrastra una imagen aquí</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP — máximo 20MB. Recomendado: 1920×1080px</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-3 justify-end">
        {selectedFile && (
          <button
            onClick={handleCancel}
            disabled={isUploading}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!selectedFile || isUploading}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Subiendo...
            </>
          ) : (
            'Guardar imagen'
          )}
        </button>
      </div>
    </div>
  );
};

export default CambiarPortadaPage;
