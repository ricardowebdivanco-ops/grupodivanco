# Frontend Boilerplate

Boilerplate moderno de React con Redux Toolkit, Tailwind CSS y componentes reutilizables.

## 🚀 Tecnologías

- **React 18** - Biblioteca de UI
- **Redux Toolkit** - Manejo de estado moderno
- **RTK Query** - Fetching de datos y cache
- **React Router Dom** - Navegación
- **Tailwind CSS** - Framework de estilos
- **React Hook Form** - Manejo de formularios
- **Heroicons** - Iconos
- **Vite** - Build tool y dev server

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── layout/         # Componentes de layout
│   └── ui/             # Componentes base de UI
├── features/           # Features organizadas por dominio
│   ├── auth/          # Autenticación
│   ├── users/         # Gestión de usuarios
│   └── ui/            # Estado global de UI
├── hooks/             # Custom hooks
├── pages/             # Páginas/Vistas
├── router/            # Configuración de rutas
├── services/          # Configuración de APIs
└── utils/             # Utilidades
```

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar en desarrollo
npm run dev
```

## 🔧 Configuración

### Variables de Entorno

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Boilerplate App
VITE_APP_VERSION=1.0.0
```

## 🎯 Características

### Autenticación
- Login/Register con validación
- JWT Token management
- Rutas protegidas
- Roles de usuario (admin/user)
- Recuperación de contraseña

### Estado Global
- Redux Toolkit con slices modernos
- RTK Query para API calls
- Persistencia de token en localStorage
- Estados de loading/error

### UI/UX
- Componentes reutilizables
- Sistema de notificaciones (Toast)
- Responsive design
- Dark/Light theme support
- Sidebar navigation

### Hooks Personalizados
- `useAuth()` - Manejo de autenticación
- `useUI()` - Estados de interfaz

## 📱 Componentes Disponibles

### UI Components
```jsx
import { Button, Input, Loading, ToastContainer } from './components/ui';

// Button con variantes
<Button variant="primary" size="md" loading={isLoading}>
  Guardar
</Button>

// Input con validación
<Input 
  label="Email" 
  error={errors.email} 
  {...register('email')}
/>
```

### Layout Components
```jsx
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Layout con sidebar
<Layout title="Dashboard">
  <YourContent />
</Layout>

// Ruta protegida
<ProtectedRoute adminOnly>
  <AdminPage />
</ProtectedRoute>
```

## 🔄 RTK Query Usage

```jsx
// En un componente
import { useGetUsersQuery, useCreateUserMutation } from '../features/users/usersApi';

function UsersComponent() {
  const { data: users, isLoading, error } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  const handleCreate = async (userData) => {
    try {
      await createUser(userData).unwrap();
      // Success
    } catch (error) {
      // Handle error
    }
  };
}
```

## 🎨 Tailwind Configuration

El proyecto incluye configuración personalizada de Tailwind con:
- Colores de marca personalizados
- Componentes pre-estilizados
- Responsive breakpoints
- Dark mode support

## 🚀 Scripts Disponibles

```bash
npm run dev        # Desarrollo
npm run build      # Build para producción
npm run preview    # Preview del build
npm run lint       # Linting
```

## 🔐 Flujo de Autenticación

1. Usuario se registra/logea
2. Backend devuelve JWT token
3. Token se guarda en localStorage y Redux
4. RTK Query usa el token automáticamente
5. Rutas protegidas verifican autenticación
6. Logout limpia token y estado

## 📊 Integración con Backend

Este frontend está diseñado para trabajar con el backend del boilerplate que incluye:

- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `POST /auth/recover-password` - Recuperar contraseña
- `POST /auth/reset-password` - Reset contraseña
- `GET /users` - Listar usuarios (admin)
- `POST /users` - Crear usuario (admin)
- `PUT /users/:id` - Actualizar usuario (admin)
- `DELETE /users/:id` - Eliminar usuario (admin)

## 🎯 Próximos Pasos para Personalizar

1. **Personalizar tema**: Modifica `tailwind.config.js`
2. **Agregar features**: Crea nuevos slices en `/features`
3. **Componentes custom**: Extiende los componentes base
4. **Agregar páginas**: Crea nuevas páginas y rutas
5. **API endpoints**: Extiende las APIs existentes

Este boilerplate te proporciona una base sólida y moderna para desarrollar aplicaciones React escalables y mantenibles.

# Update
 
