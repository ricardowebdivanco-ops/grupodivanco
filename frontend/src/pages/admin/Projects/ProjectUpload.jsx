import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CloudArrowUpIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  TagIcon,
  LinkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  useUploadProjectMediaMutation,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useGetProjectByIdQuery,
  useToggleSliderImageMutation,
  useDeleteProjectMediaMutation,  // ✅ AGREGAR ESTE IMPORT
} from "../../../features/projects/projectsApi";
import ExistingMediaManager from './ExistingMediaManager';  // ✅ AGREGAR ESTE IMPORT
import {
  selectIsUploading,
  selectUploadError,
  selectIsCreating,
  selectCreateError,
} from "../../../features/projects/projectsSlice";

const ETAPAS = [
  { value: "render", label: "Render" },
  { value: "obra", label: "Obra" },
  { value: "finalizado", label: "Finalizado" },
];

const PROJECT_TYPES = [
  "Diseño",
  "Proyecto", 
  "Dirección de Obra"
];

const ProjectUpload = ({ projectId = null, onProjectCreated = () => console.log("Función onProjectCreated por defecto"), closeModalRef }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const isEdit = !!projectId;
  
  // Exponer función de cierre para el componente padre
  useEffect(() => {
    if (closeModalRef) {
      closeModalRef.current = {
        closeModal: () => {
          console.log("Cerrando modal desde ref");
          onProjectCreated();
        }
      };
    }
  }, [closeModalRef, onProjectCreated]);

  // Estados Redux
  const isUploading = useSelector(selectIsUploading);
  const uploadError = useSelector(selectUploadError);
  const isCreating = useSelector(selectIsCreating);
  const createError = useSelector(selectCreateError);

  // Mutaciones
  const [uploadMedia] = useUploadProjectMediaMutation();
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [toggleSliderImage] = useToggleSliderImageMutation();
  const [deleteMedia, { isLoading: isDeleting }] = useDeleteProjectMediaMutation();  // ✅ AGREGAR ESTA LÍNEA
  
  // Query para obtener datos del proyecto si estamos editando
  const { data: projectData, isLoading, refetch: refetchProject } = useGetProjectByIdQuery(projectId, { skip: !isEdit });

  // Estados locales
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadSummary, setUploadSummary] = useState(null);
  const [currentSliderImageId, setCurrentSliderImageId] = useState(null);

  // Estado del formulario del proyecto
  const [form, setForm] = useState({
    title: "",
    description: "",
    shortDescription: "", // Campo para descripción corta
    year: new Date().getFullYear(),
    location: "",
    client: "",
    architect: "",
    projectType: ["Proyecto"], // ✅ Cambiar a array
    etapa: "render",
    area: "",
    content: "",
    tags: [],
    slug: "",
    kuulaUrl: "",
    startDate: "",
    endDate: "",
    isFeatured: false,
    showInSlider: false,
    isPublic: true,
    isActive: true,
    order: 0,
  });

  // Cargar datos del proyecto si estamos editando
  useEffect(() => {
    if (projectData?.data) {
      setForm({
        ...form,
        ...projectData.data,
        year: projectData.data.year || new Date().getFullYear(),
        etapa: projectData.data.etapa || "render",
        tags: projectData.data.tags || [],
        // ✅ Asegurar que projectType sea array
        projectType: Array.isArray(projectData.data.projectType) 
          ? projectData.data.projectType 
          : projectData.data.projectType 
            ? [projectData.data.projectType] 
            : ["Proyecto"],
      });
    }
    // eslint-disable-next-line
  }, [projectData]);

  // Tags disponibles
  const availableTags = [
    "residencial",
    "comercial", 
    "industrial",
    "piscinas",
    "restaurantes",
    "hoteles",
    "oficinas",
    "moderno",
    "clasico",
    "minimalista",
    "sustentable",
    "lujo",
    "economico",
    "reforma",
    "construccion_nueva",
  ];

  // Tipos de archivo
  const fileTypes = {
    render: {
      label: "Renders",
      icon: PhotoIcon,
      accept: "image/*",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Imágenes renderizadas del proyecto",
    },
    plano: {
      label: "Planos",
      icon: DocumentIcon,
      accept: ".pdf",
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Planos técnicos y arquitectónicos",
    },
    video: {
      label: "Videos",
      icon: VideoCameraIcon,
      accept: "video/*",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Videos del proyecto o recorridos",
    },
    obra_proceso: {
      label: "Obra en proceso",
      icon: PhotoIcon,
      accept: "image/*",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Fotografías durante la construcción",
    },
    obra_finalizada: {
      label: "Obra finalizada",
      icon: PhotoIcon,
      accept: "image/*",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Fotografías de la obra terminada",
    },
    otro: {
      label: "Otros",
      icon: DocumentIcon,
      accept: "*/*",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      description: "Otros archivos relacionados",
    },
  };

  // Función para generar slug
  const generateSlug = (title, year) => {
    if (!title) return "";
    return `${title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")}-${year}`;
  };

  // Manejo de cambios en el formulario
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTitleChange = (title) => {
    const newSlug = generateSlug(title, form.year);
    setForm(prev => ({
      ...prev,
      title,
      slug: newSlug,
    }));
  };

  const handleYearChange = (year) => {
    const parsedYear = parseInt(year) || new Date().getFullYear();
    const newSlug = form.title ? generateSlug(form.title, parsedYear) : "";
    setForm(prev => ({
      ...prev,
      year: parsedYear,
      slug: newSlug,
    }));
  };

  const toggleTag = (tag) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  // Funciones de manejo de archivos
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
    const validFiles = [];
    const rejectedFiles = [];

    newFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        rejectedFiles.push({
          name: file.name,
          size: file.size,
          reason: `Archivo muy grande (${(file.size / 1024 / 1024).toFixed(2)} MB). Máximo permitido: 30MB`,
        });
      } else {
        validFiles.push(file);
      }
    });

    if (rejectedFiles.length > 0) {
      alert(
        `${rejectedFiles.length} archivo(s) rechazado(s) por ser muy grandes:\n\n${rejectedFiles
          .map((f) => `• ${f.name}: ${f.reason}`)
          .join("\n")}`
      );
    }

    if (validFiles.length > 0) {
      const filesWithMetadata = validFiles.map((file) => {
        // ✅ Detectar tipo de archivo automáticamente
        let fileType = "render"; // Por defecto
        if (file.type.startsWith("video/")) {
          fileType = "video";
        } else if (file.type.startsWith("image/")) {
          fileType = "render"; // Imágenes por defecto como render
        } else if (file.type === "application/pdf") {
          fileType = "plano";
        }

        return {
          file,
          id: Math.random().toString(36).substr(2, 9),
          type: fileType, // ✅ Usar tipo detectado
          description: "",
          isMain: files.length === 0,
          preview: file.type.startsWith("image/") || file.type.startsWith("video/") ? URL.createObjectURL(file) : null,
        };
      });

      setFiles(prev => [...prev, ...filesWithMetadata]);
    }
  };

  const removeFile = (fileId) => {
    const fileToRemove = files.find(f => f.id === fileId);
    if (!fileToRemove) return;

    const isMainFile = fileToRemove.isMain;
    const confirmMessage = isMainFile
      ? `¿Eliminar "${fileToRemove.file.name}"?\n\n⚠️ Este es el archivo principal. Si lo eliminas, se asignará automáticamente otro archivo como principal.`
      : `¿Eliminar "${fileToRemove.file.name}"?`;

    if (confirm(confirmMessage)) {
      setFiles(prev => {
        const updated = prev.filter(f => f.id !== fileId);
        if (updated.length > 0 && !updated.some(f => f.isMain)) {
          updated[0].isMain = true;
        }
        return updated;
      });

      setUploadProgress(prev => {
        const { [fileId]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const updateFileType = (fileId, type) => {
    setFiles(prev => prev.map(f => (f.id === fileId ? { ...f, type } : f)));
  };

  const updateFileDescription = (fileId, description) => {
    setFiles(prev => prev.map(f => (f.id === fileId ? { ...f, description } : f)));
  };

  const setAsMain = (fileId) => {
    setFiles(prev => prev.map(f => ({ ...f, isMain: f.id === fileId })));
  };

  // Prevenir submit al presionar Enter en inputs (excepto textarea)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  // Función para subir archivos
  const uploadFiles = async (targetProjectId = projectId) => {
    if (!targetProjectId || files.length === 0) return;

    setIsUploadingFiles(true);
    setUploadSummary(null);

    const results = {
      successful: [],
      failed: [],
      total: files.length,
    };

    try {
      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];

        setUploadProgress(prev => ({
          ...prev,
          [fileData.id]: {
            status: "uploading",
            progress: 0,
            fileName: fileData.file.name,
            current: i + 1,
            total: files.length,
          },
        }));

        try {
          const formData = new FormData();
          formData.append("file", fileData.file);
          formData.append("type", fileData.type);
          formData.append("description", fileData.description);
          formData.append("isMain", fileData.isMain.toString());

          const result = await uploadMedia({
            projectId: targetProjectId,
            formData,
          }).unwrap();

          setUploadProgress(prev => ({
            ...prev,
            [fileData.id]: {
              status: "completed",
              progress: 100,
              fileName: fileData.file.name,
              current: i + 1,
              total: files.length,
            },
          }));

          results.successful.push({
            file: fileData.file.name,
            type: fileData.type,
            mediaId: result.data?.id,
            originalName: result.data?.originalName,
            urls: result.data?.urls,
            isMain: result.data?.isMain,
            result,
          });
        } catch (error) {
          let errorMessage = "Error desconocido";
          if (error.status === 413) {
            errorMessage = "Archivo muy grande para el servidor";
          } else if (error.status === 400) {
            errorMessage = error.data?.message || "Error en la solicitud";
          } else if (error.status === 500) {
            errorMessage = "Error interno del servidor";
          } else {
            errorMessage = error.data?.message || error.message || "Error de conexión";
          }

          setUploadProgress(prev => ({
            ...prev,
            [fileData.id]: {
              status: "error",
              progress: 0,
              fileName: fileData.file.name,
              error: errorMessage,
              current: i + 1,
              total: files.length,
            },
          }));

          results.failed.push({
            file: fileData.file.name,
            type: fileData.type,
            error: errorMessage,
          });
        }

        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      setUploadSummary(results);

      setTimeout(() => {
        setFiles(prev => prev.filter(f => {
          const progress = uploadProgress[f.id];
          return progress?.status !== "completed";
        }));

        setTimeout(() => {
          setUploadProgress({});
          setUploadSummary(null);
        }, 5000);
      }, 2000);
    } catch (error) {
      console.error("Error general en subida:", error);
    } finally {
      setIsUploadingFiles(false);
    }
  };

  const closeModalAndRefresh = () => {
    console.log("Intentando cerrar modal desde closeModalAndRefresh");
    
    // Intenta cerrar desde el padre primero
    if (closeModalRef && closeModalRef.current) {
      closeModalRef.current.closeModal();
    } else {
      console.log("Usando onProjectCreated directamente");
      onProjectCreated();
    }
    
    // Como último recurso, busca el modal padre y lo cierra
    try {
      const modalElement = document.getElementById("projectModal");
      if (modalElement) {
        console.log("Encontrado elemento modal por ID, intentando remover");
        // Forzar varias técnicas de cierre
        modalElement.style.display = "none";
        modalElement.classList.add("hidden");
        
        // También podemos intentar simular un clic en el botón de cierre
        const closeButton = document.getElementById("modalCloseButton");
        if (closeButton) {
          console.log("Encontrado botón de cierre, simulando clic");
          closeButton.click();
        }
      }
      
      // Forzar llamada al parent con timeouts para asegurar ejecución
      setTimeout(() => {
        if (typeof onProjectCreated === 'function') {
          onProjectCreated();
        }
      }, 100);
    } catch (error) {
      console.error("Error intentando cerrar modal manualmente:", error);
    }
  };

  // ✅ Función para eliminar una imagen existente
  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('¿Eliminar esta imagen? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteMedia({ projectId, mediaId }).unwrap();
      alert('Imagen eliminada exitosamente');
      refetchProject(); // Recargar datos del proyecto
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      alert('Error al eliminar la imagen');
    }
  };

  // ✅ Función para marcar/desmarcar imagen del slider
  const handleToggleSlider = async (mediaId) => {
    try {
      await toggleSliderImage({ projectId, mediaId }).unwrap();
      refetchProject(); // Recargar datos del proyecto
    } catch (error) {
      console.error('Error al cambiar imagen del slider:', error);
      alert('Error al actualizar imagen del slider');
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validación básica
    if (!form.title.trim()) {
      alert("El título es requerido");
      return;
    }
    
    if (!form.projectType || form.projectType.length === 0) {
      alert("Debes seleccionar al menos un tipo de proyecto");
      return;
    }

    try {
      const finalFormData = {
        ...form,
        slug: form.slug || generateSlug(form.title, form.year),
      };

      if (isEdit) {
        const result = await updateProject({ id: projectId, ...finalFormData }).unwrap();
        console.log('✅ Proyecto actualizado:', result);
        
        // ✅ AGREGAR: Subir archivos nuevos si hay alguno
        if (files.length > 0) {
          console.log(`📤 Subiendo ${files.length} archivos nuevos al proyecto ${projectId}`);
          await uploadFiles(projectId);
        }
        
        // Llamar a onProjectCreated para cerrar el modal después de guardar
        console.log("Guardar en modo edición");
        
        // Solo cerrar si la subida fue exitosa o no había archivos
        if (files.length === 0 || Object.values(uploadProgress).every(p => p.status !== "error")) {
          closeModalAndRefresh();
        }
      } else {
        const projectResult = await createProject(finalFormData).unwrap();
        console.log('✅ Proyecto creado:', projectResult);
        const newProjectId = projectResult.data.id;

        if (files.length > 0) {
          await uploadFiles(newProjectId);
        }

        if (Object.values(uploadProgress).every(p => p.status !== "error")) {
          resetForm();
          // Llamar a onProjectCreated para cerrar el modal después de guardar
          console.log("Guardar en modo creación");
          closeModalAndRefresh();
        }
      }
    } catch (error) {
      console.error('❌ Error al guardar proyecto:', error);
      
      // Extraer mensaje de error más específico
      let errorMessage = "Error al guardar el proyecto";
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Mostrar error más específico
      alert(`❌ ${errorMessage}`);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      shortDescription: "", // Campo para descripción corta
      year: new Date().getFullYear(),
      location: "",
      client: "",
      architect: "",
      projectType: ["Proyecto"], // ✅ Cambiar a array
      etapa: "render",
      area: "",
      content: "",
      tags: [],
      slug: "",
      kuulaUrl: "",
      startDate: "",
      endDate: "",
      isFeatured: false,
      showInSlider: false,
      isPublic: true,
      isActive: true,
      order: 0,
    });
    setFiles([]);
    setUploadProgress({});
    setUploadSummary(null);
  };

  return (
    <div className="bg-white w-full h-full flex flex-col overflow-hidden">
      {/* Header fijo */}
      <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEdit ? "Editar Proyecto" : "Crear Proyecto"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit 
                ? "Modifica la información del proyecto" 
                : "Completa la información del proyecto y sube los archivos"}
            </p>
          </div>
        </div>
      </div>

      {/* Contenido scrolleable y formulario */}
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col flex-1 h-full">
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ maxHeight: "calc(90vh - 140px)" }}>
          {/* Indicador de progreso de subida */}
          {isUploadingFiles && Object.keys(uploadProgress).length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-blue-900">
                  Subiendo archivos ({Object.values(uploadProgress).filter(p => p.status === "completed").length}/{Object.keys(uploadProgress).length})
                </h4>
                <ArrowPathIcon className="h-4 w-4 text-blue-600 animate-spin" />
              </div>

              <div className="space-y-2">
                {Object.entries(uploadProgress).map(([fileId, progress]) => (
                  <div key={fileId} className="bg-white rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-700 truncate max-w-xs">
                          {progress.fileName}
                        </span>
                        <span className="text-xs text-blue-500">
                          ({progress.current}/{progress.total})
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {progress.status === "uploading" && <span className="text-blue-600">📤</span>}
                        {progress.status === "completed" && <span className="text-green-600">✅</span>}
                        {progress.status === "error" && <span className="text-red-600">❌</span>}
                      </div>
                    </div>
                    {progress.status === "uploading" && (
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse w-1/3" />
                      </div>
                    )}
                    {progress.status === "error" && (
                      <p className="text-xs text-red-600 mt-1">Error: {progress.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumen de subida */}
          {uploadSummary && (
            <div className={`border rounded-lg p-4 mb-4 ${
              uploadSummary.failed.length === 0 
                ? "bg-green-50 border-green-200" 
                : "bg-yellow-50 border-yellow-200"
            }`}>
              <h4 className="font-medium mb-3">📊 Resumen de subida</h4>
              <div className="space-y-2">
                <p className="text-green-700 font-medium">
                  ✅ {uploadSummary.successful.length} archivos subidos exitosamente
                </p>
                {uploadSummary.failed.length > 0 && (
                  <p className="text-red-700 font-medium">
                    ❌ {uploadSummary.failed.length} archivos fallaron
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Formulario del proyecto (sin tag form) */}
          <div className="space-y-4 overflow-y-auto">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-base font-medium text-gray-900 mb-3">Información del proyecto</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre del proyecto"
                  />
                </div>

                {/* Año */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año *</label>
                  <input
                    name="year"
                    type="number"
                    value={form.year}
                    onChange={(e) => handleYearChange(e.target.value)}
                    min="2000"
                    max={new Date().getFullYear() + 5}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ciudad, País"
                  />
                </div>

                {/* Cliente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <input
                    name="client"
                    value={form.client}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre del cliente"
                  />
                </div>

                {/* Área */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                  <input
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Área en m²"
                  />
                </div>

                {/* Tipo de Proyecto - Selección múltiple */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Proyecto (puede seleccionar varios)
                  </label>
                  <div className="space-y-2">
                    {PROJECT_TYPES.map(type => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Array.isArray(form.projectType) && form.projectType.includes(type)}
                          onChange={(e) => {
                            const currentTypes = Array.isArray(form.projectType) ? form.projectType : [];
                            if (e.target.checked) {
                              // Agregar el tipo
                              setForm({ ...form, projectType: [...currentTypes, type] });
                            } else {
                              // Remover el tipo (solo si no es el último)
                              const newTypes = currentTypes.filter(t => t !== type);
                              if (newTypes.length > 0) {
                                setForm({ ...form, projectType: newTypes });
                              } else {
                                alert('Debe seleccionar al menos un tipo de proyecto');
                              }
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Etapa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Etapa</label>
                  <select
                    name="etapa"
                    value={form.etapa}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {ETAPAS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                  <input
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="se-genera-automaticamente"
                    readOnly={!isEdit}
                  />
                </div>

                {/* URL de Kuula */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL de Kuula (Tour 360°)</label>
                  <input
                    name="kuulaUrl"
                    value={form.kuulaUrl}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://kuula.co/share/..."
                  />
                </div>

                {/* Descripción */}
                {/* Descripción Corta */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción Corta <span className="text-gray-500">(Máx 200 caracteres)</span>
                  </label>
                  <textarea
                    name="shortDescription"
                    value={form.shortDescription || ""}
                    onChange={handleChange}
                    rows={2}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descripción breve para mostrar en listados..."
                    maxLength={200}
                  />
                  <div className="text-xs text-gray-500 text-right mt-1">{(form.shortDescription || "").length}/200</div>
                </div>

                {/* Descripción completa */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción Completa <span className="text-gray-500">(Máx 1500 caracteres)</span>
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe el proyecto..."
                    maxLength={1500}
                  />
                  <div className="text-xs text-gray-500 text-right mt-1">{form.description.length}/1500</div>
                </div>
              </div>

              {/* Tags - Compactos */}
              <div className="mt-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <TagIcon className="h-4 w-4" />
                  Tags ({form.tags.length} seleccionados)
                </label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-1">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2 py-1 text-xs font-medium rounded transition-all duration-150 ${
                        form.tags.includes(tag)
                          ? "bg-blue-100 text-blue-800 border border-blue-300"
                          : "bg-gray-100 text-gray-700 border border-transparent hover:bg-gray-200"
                      }`}
                    >
                      {tag.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opciones - Compactas */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Opciones</h4>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={form.isFeatured}
                      onChange={handleChange}
                      className="rounded"
                    />
                    Destacado
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="showInSlider"
                      checked={form.showInSlider}
                      onChange={handleChange}
                      className="rounded"
                    />
                    En slider
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={form.isPublic}
                      onChange={handleChange}
                      className="rounded"
                    />
                    Público
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                      className="rounded"
                    />
                    Activo
                  </label>
                </div>
              </div>
            </div>

            {/* ✅ Gestor de imágenes existentes - Solo al editar */}
            {isEdit && projectData?.data?.media && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <ExistingMediaManager
                  media={projectData.data.media}
                  onDelete={handleDeleteMedia}
                  onToggleSlider={handleToggleSlider}
                  isDeleting={isDeleting}
                />
              </div>
            )}

            {/* ✅ Zona de subida - Para editar y crear */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-base font-medium text-gray-900 mb-2">
                {isEdit ? 'Agregar más archivos' : 'Archivos del proyecto'}
              </h3>
                
                <div
                  className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <CloudArrowUpIcon className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                  <h4 className="text-sm font-medium text-gray-900 mb-0.5">Arrastra archivos aquí</h4>
                  <p className="text-xs text-gray-500 mb-1">
                    O{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      selecciona archivos
                    </button>
                  </p>
                  <div className="text-xs text-amber-600">⚠️ Max: 30 MB por archivo</div>
                </div>

                {/* Lista de archivos - Más compacta */}
                {files.length > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        Archivos ({files.length})
                      </h4>
                      {files.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`¿Eliminar todos los ${files.length} archivos?`)) {
                              setFiles([]);
                              setUploadProgress({});
                            }
                          }}
                          className="text-xs text-red-600 hover:text-red-700 px-2 py-0.5 rounded"
                        >
                          🗑️ Eliminar todos
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                      {files.map((fileData) => {
                        const fileType = fileTypes[fileData.type];
                        const IconComponent = fileType.icon;
                        const progress = uploadProgress[fileData.id];

                        return (
                          <div
                            key={fileData.id}
                            className={`flex items-center gap-2 p-2 rounded transition-all ${
                              progress?.status === "completed"
                                ? "bg-green-50 border border-green-200"
                                : progress?.status === "error"
                                ? "bg-red-50 border border-red-200"
                                : progress?.status === "uploading"
                                ? "bg-blue-50 border border-blue-200"
                                : "bg-white border border-gray-100"
                            }`}
                          >
                            {/* Preview mejorado */}
                            <div className="flex-shrink-0 relative">
                              {fileData.preview ? (
                                fileData.file.type.startsWith("video/") ? (
                                  <div className="relative w-16 h-16 rounded overflow-hidden bg-black">
                                    <video
                                      src={fileData.preview}
                                      className="w-full h-full object-cover"
                                      muted
                                      playsInline
                                      preload="metadata"
                                    />
                                    {/* Ícono de play overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                      <VideoCameraIcon className="h-6 w-6 text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <img
                                    src={fileData.preview}
                                    alt=""
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                )
                              ) : (
                                <div className={`w-16 h-16 ${fileType.bgColor} rounded flex items-center justify-center`}>
                                  <IconComponent className={`h-8 w-8 ${fileType.color}`} />
                                </div>
                              )}
                            </div>

                            {/* Info del archivo */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {fileData.file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>

                              {/* Controles en línea */}
                              <div className="flex gap-2 mt-1">
                                <select
                                  value={fileData.type}
                                  onChange={(e) => updateFileType(fileData.id, e.target.value)}
                                  className="text-xs px-2 py-1 border rounded"
                                >
                                  {Object.entries(fileTypes).map(([key, type]) => (
                                    <option key={key} value={key}>{type.label}</option>
                                  ))}
                                </select>
                                
                                <button
                                  type="button"
                                  onClick={() => setAsMain(fileData.id)}
                                  className={`text-xs px-2 py-1 rounded ${
                                    fileData.isMain
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {fileData.isMain ? "★ Principal" : "Principal"}
                                </button>
                              </div>
                            </div>

                            {/* Botón eliminar */}
                            <button
                              type="button"
                              onClick={() => removeFile(fileData.id)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

            {/* Errores */}
            {(uploadError || createError) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="flex items-center gap-2 text-red-800">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span className="text-sm">Error: {uploadError || createError}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer fijo con botones */}
        <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-white sticky bottom-0">
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Botón Cancelar clickeado - Intentando cerrar modal directamente");
                
                // Usa la función de cierre mejorada
                closeModalAndRefresh();
              }}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isCreating || isUploadingFiles}
            >
              {isEdit ? "Guardar Cambios" : "Crear Proyecto"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProjectUpload;