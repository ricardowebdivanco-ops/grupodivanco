import React, { useState, useRef } from 'react';
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdStar, MdTune, MdImage, MdDeleteForever } from 'react-icons/md';

import { useGetProjectsQuery, useDeleteProjectMutation, useUpdateProjectMutation, useToggleSliderImageMutation } from '../../../features/projects/projectsApi';
import ProjectUpload from './ProjectUpload';


const AdminProjectPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const closeModalRef = useRef(null);
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  // Función para cerrar el modal
  const closeModal = () => {
    console.log("Cerrando modal desde closeModal - ANTES:", { showForm });
    
    // Forzar el cierre del modal por DOM como fallback
    try {
      const modalElement = document.getElementById("projectModal");
      if (modalElement) {
        modalElement.style.display = "none";
      }
    } catch (error) {
      console.error("Error forzando cierre del modal:", error);
    }
    
    // Actualizar el estado React con timeouts para asegurar cambios de estado
    setTimeout(() => {
      setShowForm(false);
      setTimeout(() => {
        setSelectedProject(null);
        // Refrescar los datos
        refetch();
      }, 100);
    }, 100);
    
    console.log("Cerrando modal desde closeModal - DESPUÉS:", { showForm: false });
  };

  // Cambiar showInSlider
  const handleToggleSlider = async (project) => {
    try {
      await updateProject({ id: project.id, showInSlider: !project.showInSlider }).unwrap();
      refetch();
    } catch (err) {
      alert('Error al actualizar el slider.');
    }
  };

  // Marcar imagen como slider
  const [toggleSliderImage, { isLoading: isTogglingSliderImage }] = useToggleSliderImageMutation();
  const handleSetSliderImage = async (projectId, mediaId) => {
    try {
      await toggleSliderImage({ projectId, mediaId }).unwrap();
      refetch();
    } catch (err) {
      alert('Error al marcar imagen del slider.');
    }
  };

  const {
    data: projectsData,
    isLoading,
    error,
    refetch
  } = useGetProjectsQuery({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
    publicOnly: false  // Ver todos los proyectos (incluidos inactivos) en admin
  });

  const projects = projectsData?.data || [];

  const handleDelete = async (id, permanent = false) => {
    const confirmMessage = permanent 
      ? '⚠️ BORRADO PERMANENTE\n\n¿Estás seguro de ELIMINAR COMPLETAMENTE este proyecto?\n\nEsta acción NO se puede deshacer y borrará:\n- El proyecto\n- Todas sus imágenes\n- Toda su información\n\n¿Continuar?' 
      : '¿Desactivar este proyecto? (Podrás reactivarlo después)';
    
    if (window.confirm(confirmMessage)) {
      try {
        const result = await deleteProject({ id, permanent }).unwrap();
        console.log('✅ Proyecto eliminado:', result);
        alert(result.message || 'Proyecto eliminado exitosamente');
        refetch();
      } catch (err) {
        console.error('❌ Error al eliminar proyecto:', err);
        const errorMessage = err?.data?.message || err?.message || 'Error desconocido al eliminar el proyecto.';
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Proyectos</h1>
            <p className="mt-2 text-gray-600">Administra los proyectos</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => {
                setSelectedProject(null);
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <MdAdd className="w-4 h-4 mr-2" />
              Nuevo Proyecto
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Buscar proyectos</label>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por título..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando proyectos...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">Error al cargar los proyectos</p>
              <p className="text-sm text-gray-500 mt-2">{JSON.stringify(error)}</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No hay proyectos disponibles</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyecto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Año</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Destacado</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Mostrar en Slider</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <MdImage className="w-4 h-4" />
                        <span>Imagen Principal</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map(project => (
                    <tr 
                      key={project.id} 
                      className={`hover:bg-gray-50 ${!project.isActive ? 'opacity-50 bg-red-50' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {project.media && project.media.length > 0 && project.media[0].urls?.mobile && (
                            <img
                              className="h-12 w-12 rounded-lg object-cover mr-2"
                              src={project.media[0].urls.mobile}
                              alt={project.title}
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{project.title}</span>
                              {!project.isActive && (
                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  ELIMINADO
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{project.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{project.year}</td>
                      <td className="px-6 py-4 text-center">
                        {project.isFeatured ? <MdStar className="w-5 h-5 text-yellow-400 inline" /> : <MdStar className="w-5 h-5 text-gray-300 inline" />}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          className={`w-10 h-6 rounded-full flex items-center transition-all duration-300 focus:outline-none shadow ${
                            project.showInSlider 
                              ? 'bg-blue-500 justify-end' 
                              : 'bg-gray-300 justify-start'
                          }`}
                          title={project.showInSlider ? 'Quitar del slider' : 'Mostrar en slider'}
                          onClick={() => handleToggleSlider(project)}
                          disabled={isUpdating}
                        >
                          <span className={`bg-white w-4 h-4 rounded-full transform mx-1 shadow-sm ${
                            isUpdating ? 'animate-pulse' : ''
                          }`}></span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {project.media && project.media.length > 0 ? (
                          <div className="flex flex-row items-center gap-2 flex-wrap justify-center">
                            {project.media.map((img) => (
                              <div key={img.id} className="relative group">
                                <img 
                                  src={img.urls?.thumbnail || img.urls?.mobile} 
                                  alt={`Imagen ${img.id}`}
                                  className={`w-12 h-12 object-cover rounded-md border-2 transition-all
                                    ${img.isSliderImage 
                                      ? 'border-green-500 ring-2 ring-green-300' 
                                      : 'border-gray-200 hover:border-blue-400 cursor-pointer'
                                    }`}
                                  onClick={() => handleSetSliderImage(project.id, img.id)}
                                  title={img.isSliderImage ? 'Imagen actual del slider' : 'Marcar como imagen del slider'}
                                />
                                {/* Tooltip que muestra la imagen ampliada - reemplazado para corregir el problema */}
                                <div 
                                  className="fixed z-50 invisible group-hover:visible bg-white p-2 rounded-md shadow-lg"
                                  style={{
                                    top: 'calc(50% - 120px)',
                                    left: 'calc(50% - 60px)',
                                  }}
                                >
                                  <img 
                                    src={img.urls?.medium || img.urls?.mobile} 
                                    alt={`Vista previa ${img.id}`}
                                    className="w-32 h-32 object-cover rounded-md" 
                                  />
                                </div>
                                {img.isSliderImage && (
                                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    ✓
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-300">Sin imágenes</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-gray-500">{project.status || project.etapa}</span>
                          <div className="flex gap-1">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              project.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {project.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                            {!project.isPublic && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                Privado
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver proyecto"
                            onClick={() => window.open(`/proyectos/${project.slug}`, '_blank')}
                          >
                            <MdVisibility className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProject(project);
                              setShowForm(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar proyecto"
                          >
                            <MdEdit className="w-4 h-4" />
                          </button>
                          {project.isActive ? (
                            <button
                              className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                              title="Desactivar proyecto"
                              onClick={() => handleDelete(project.id, false)}
                              disabled={isDeleting}
                            >
                              <MdDelete className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Borrar permanentemente"
                              onClick={() => handleDelete(project.id, true)}
                              disabled={isDeleting}
                            >
                              <MdDeleteForever className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear/editar proyecto */}
      {showForm && (
        <div 
          id="projectModal" 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start md:items-center justify-center p-4 md:p-6 overflow-auto"
          onClick={(e) => {
            // Solo cerrar si el clic fue directamente en el fondo oscuro (no en el contenido)
            if (e.target === e.currentTarget) {
              console.log("Clic fuera del modal detectado");
              closeModal();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[95vh] relative overflow-hidden my-8">
            <button
              id="modalCloseButton"
              className="absolute top-3 right-3 text-gray-800 hover:text-gray-900 text-3xl font-bold z-50 bg-white rounded-full h-10 w-10 flex items-center justify-center shadow-md border border-gray-300 hover:border-gray-400"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Botón cerrar del modal padre clickeado");
                closeModal();
              }}
            >
              ×
            </button>
            <ProjectUpload
              projectId={selectedProject?.id || null}
              closeModalRef={closeModalRef}
              onProjectCreated={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjectPage;
