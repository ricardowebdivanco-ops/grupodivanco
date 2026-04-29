import { createBrowserRouter, Navigate } from "react-router-dom";

// 📱 Layout Components (imports centralizados)
import {
  PublicLayout,
  AdminLayout,
  AuthLayout,
  ProtectedRoute,
} from "../components/layout";

// 🏛️ Landing Pages (Público)
import HomePage from "../pages/public/HomePage";
import ShowroomPage from "../pages/public/ShowroomPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import CategoryProductsPage from "../pages/CategoryProductsPage";
import SubcategoryProductsPage from "../pages/SubcategoryProductsPage";
import CategoryPage from "../pages/public/CategoryPage";
import SubCategoryPage from "../pages/public/SubCategoryPage";
import ProjectsPage from "../pages/public/ProjectsPage";
import ProjectDetailPage from "../pages/public/ProjectDetailPage";
import BlogPage from "../pages/public/BlogPage";
import BlogPostPage from "../pages/public/BlogPostPage";
import AboutPage from "../pages/public/AboutPage";
import ContactPage from "../pages/public/ContactPage";
import SearchPage from "../pages/public/SearchPage";
import EdicionesPage from "../components/layout/public/EdicionesPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";

// 🔐 Auth Pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

// 🎛️ Admin Pages
import DashboardPage from "../pages/admin/DashboardPage";
import UsersPage from "../pages/admin/UsersPage";
// Nuevo sistema unificado de administración
import ShowroomAdminPage from "../pages/admin/showroom/ShowroomAdminPage";
import ProjectUpload from "../pages/admin/Projects/ProjectUpload.jsx";
import AdminBlogPage from "../pages/admin/Blog/AdminBlogPage.jsx";
import AdminSubscribersPage from "../pages/admin/AdminSubscribersPage";
import AdminProjectPage from "../pages/admin/Projects/AdminProjectPage.jsx";
import CambiarPortadaPage from "../pages/admin/CambiarPortadaPage.jsx";

export const router = createBrowserRouter(
  [
    // 🌐 PUBLIC ROUTES (Landing Page)
    {
      path: "/",
      element: <PublicLayout />,
      children: [
        {
          index: true, // Ruta principal "/"
          element: <HomePage />,
        },
        {
          path: "showroom",
          element: <ShowroomPage />,
        },
        {
          path: "/productos/:slug",
          element: <ProductDetailPage />,
        },
        {
          path: "showroom/:categorySlug",
          element: <CategoryProductsPage />,
        },
        {
          path: "showroom/:categorySlug/:subcategorySlug",
          element: <SubcategoryProductsPage />,
        },
        
        {
          path: "proyectos/",
          element: <ProjectsPage />, // Filtrada por año con ruta específica
        },
        // {
        //   path: 'proyectos/año/:year',
        //   element: <ProjectsPage />, // Filtrada por año con ruta específica
        // },
        {
          path: "proyectos/:slug",
          element: <ProjectDetailPage />,
        },
        {
          path: "ediciones",
          element: <EdicionesPage />,
        },
        {
          path: "blog",
          element: <BlogPage />,
        },
        {
          path: "blog/:slug",
          element: <BlogPostPage />,
        },
        {
          path: "nosotros",
          element: <AboutPage />,
        },
        {
          path: "contacto",
          element: <ContactPage />,
        },
        {
          path: "buscar",
          element: <SearchPage />,
        },
        {
          path: "no-autorizado",
          element: <UnauthorizedPage />,
        },
        {
          path: "unauthorized",
          element: <UnauthorizedPage />,
        },
      ],
    },

    // 🔐 AUTH ROUTES (Con AuthLayout)
    {
      path: "/auth",
      element: <AuthLayout />,
      children: [
        {
          path: "login",
          element: <LoginPage />,
        },
        {
          path: "register",
          element: <RegisterPage />,
        },
        {
          path: "forgot-password",
          element: <ForgotPasswordPage />,
        },
        {
          path: "reset-password",
          element: <ResetPasswordPage />,
        },
      ],
    },

    // 🎛️ ADMIN ROUTES (Protegidas)
    {
      path: "/admin",
      element: (
        <ProtectedRoute adminOnly>
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <Navigate to="/admin/dashboard" replace />,
        },
        {
          path: "dashboard",
          element: <DashboardPage />,
        },
        {
          path: "users",
          element: (
            <ProtectedRoute
              adminOnly
              showAccessDenied={true}
              fallbackPath="/admin/dashboard"
            >
              <UsersPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "categories",
          element: <ShowroomAdminPage />,
        },
        {
          path: "showroom",
          element: <ShowroomAdminPage />,
        },
        {
          path: "projects",
          element: <Navigate to="/admin/proyectosEdit" replace />, // Redirigir para evitar duplicación
        },
        {
          path: "/admin/proyectosEdit",
          element: <AdminProjectPage />,
        },
        {
          path: "blog",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminBlogPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "subscribers",
          element: <AdminSubscribersPage />,
        },
        {
          path: "cambiarPortada",
          element: <CambiarPortadaPage />,
        },
      ],
    },

    // 🔄 REDIRECTS para compatibilidad
    {
      path: "/dashboard",
      element: <Navigate to="/admin/dashboard" replace />,
    },
    {
      path: "/login",
      element: <Navigate to="/auth/login" replace />,
    },
    {
      path: "/register",
      element: <Navigate to="/auth/register" replace />,
    },
    {
      path: "/admin/categories",
      element: <Navigate to="/admin/showroom" replace />,
    },

    // 🚫 404 - Página no encontrada
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);
