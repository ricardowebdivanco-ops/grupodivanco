import { useState } from 'react';
import { 
  useGetUsersQuery, 
  useCreateUserMutation, 
  useUpdateUserMutation, 
  useDeleteUserMutation 
} from '../../features/users/usersApi';
import { useUI } from '../../hooks/useUI';
import { Button, Input, Loading } from '../../components/ui';
import { useForm } from 'react-hook-form';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

const UsersPage = () => {
  // ✅ CAMBIO: Destructurar la respuesta correctamente
  const { data: usersResponse, isLoading, error } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const { showSuccess, showError } = useUI();

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // ✅ EXTRAER el array de usuarios de la respuesta
  const users = usersResponse?.data || [];

  

  const handleCreateUser = async (data) => {
    try {
      await createUser(data).unwrap();
      showSuccess('Usuario creado exitosamente');
      setShowModal(false);
      reset();
    } catch (error) {
      console.error('Error creating user:', error);
      showError(error.data?.message || 'Error al crear usuario');
    }
  };

  const handleUpdateUser = async (data) => {
    try {
      await updateUser({ id: editingUser.id, ...data }).unwrap();
      showSuccess('Usuario actualizado exitosamente');
      setShowModal(false);
      setEditingUser(null);
      reset();
    } catch (error) {
      console.error('Error updating user:', error);
      showError(error.data?.message || 'Error al actualizar usuario');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await deleteUser(userId).unwrap();
        showSuccess('Usuario eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting user:', error);
        showError(error.data?.message || 'Error al eliminar usuario');
      }
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    reset();
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    reset({
      // ✅ AJUSTAR campos según la estructura real del usuario
      username: user.email || user.username, // Usar email como username
      email: user.email,
      role: user.role
    });
    setShowModal(true);
  };

  const onSubmit = editingUser ? handleUpdateUser : handleCreateUser;

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-64">
      <Loading text="Cargando usuarios..." />
    </div>
  );

  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-600">Error al cargar usuarios: {error.message}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Reintentar
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4">
            Usuarios
            <span className="block text-sm font-normal text-gray-500 mt-2 tracking-wider uppercase">
              — Gestión de usuarios del sistema
            </span>
          </h1>
        </div>
        <Button onClick={openCreateModal} className="flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

     

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg font-light">No hay usuarios registrados</p>
            <Button onClick={openCreateModal} className="mt-4">
              Crear primer usuario
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id}>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-lg font-light text-white">
                          {(user.name || user.email || user.username || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-lg font-light text-gray-900">
                        {user.name || user.email || user.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email && <span>{user.email}</span>}
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {user.role}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Creado: {new Date(user.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(user)}
                      className="px-3 py-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="px-3 py-2"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-light text-gray-900">
                {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'El email es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="usuario@ejemplo.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Juan Pérez"
                />
              </div>

              {/* Contraseña (solo al crear) */}
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    {...register('password', {
                      required: 'La contraseña es requerida',
                      minLength: {
                        value: 6,
                        message: 'Mínimo 6 caracteres'
                      }
                    })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                  )}
                </div>
              )}

              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  {...register('role', { required: 'Selecciona un rol' })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar rol</option>
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                  <option value="editor">Editor</option>
                </select>
                {errors.role && (
                  <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingUser ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;