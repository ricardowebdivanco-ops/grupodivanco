import { useSelector, useDispatch } from 'react-redux';
// ❌ QUITAR: import { useNavigate } from 'react-router-dom';
import { 
  selectAuth, 
  selectUser, 
  selectIsAuthenticated, 
  selectIsLoading,
  logout as logoutAction
} from '../features/auth/authSlice';
import { useLogoutUserMutation } from '../features/auth/authApi';
import { useUI } from './useUI';

export const useAuth = () => {
  const dispatch = useDispatch();
  // ❌ QUITAR: const navigate = useNavigate();
  const { showSuccess, showError } = useUI();
  
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const [logoutUser] = useLogoutUserMutation();

  // Computed values for better UX
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user' || user?.role === 'admin';
  const userName = user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email;
  const initials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?';

  // 🆕 NUEVO: Logout SIN navegación (para usar desde fuera del Router)
  const handleLogoutWithoutNavigate = async () => {
    try {
      // 1. Logout del servidor
      try {
        await logoutUser().unwrap();
        showSuccess('Sesión cerrada exitosamente');
      } catch (apiError) {
        showError('Error al cerrar sesión en el servidor');
      }
      
      // 2. Logout local
      dispatch(logoutAction());
      
      return true;
    } catch (error) {
      dispatch(logoutAction());
      showError('Error inesperado al cerrar sesión');
      return false;
    }
  };

  // Permission utilities
  const hasPermission = (requiredRole) => {
    if (!isAuthenticated || !user) return false;
    
    switch (requiredRole) {
      case 'admin':
        return user.role === 'admin';
      case 'user':
        return user.role === 'user' || user.role === 'admin';
      default:
        return isAuthenticated;
    }
  };

  const hasAnyRole = (roles = []) => {
    if (!isAuthenticated || !user) return false;
    return roles.some(role => hasPermission(role));
  };

  const canAccess = (resource) => {
    if (!isAuthenticated) return false;
    
    // Admin can access everything
    if (isAdmin) return true;
    
    // Define resource permissions
    const permissions = {
      users: ['admin'],
      categories: ['admin'],
      projects: ['admin'],
      blog: ['admin'],
      dashboard: ['admin', 'user'],
      profile: ['admin', 'user']
    };
    
    const requiredRoles = permissions[resource] || ['user'];
    return hasAnyRole(requiredRoles);
  };

  return {
    // Auth state
    ...auth,
    user,
    isAuthenticated,
    isLoading,
    
    // User info
    userName,
    initials,
    
    // Permissions
    isAdmin,
    isUser,
    hasPermission,
    hasAnyRole,
    canAccess,
    
    // Actions (sin navegación)
    logoutWithoutNavigate: handleLogoutWithoutNavigate,
  };
};