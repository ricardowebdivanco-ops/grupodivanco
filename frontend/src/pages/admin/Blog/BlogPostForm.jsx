import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiSave, FiEye, FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import { EditorJSComponent } from "../../../components/ui";
import { 
  useGetAvailableProjectsQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useUploadFeaturedImageMutation,
  useGetBlogPostByIdQuery
} from "../../../features/blog/blogApi";

const BlogPostForm = React.memo(({ post, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Determinar si estamos editando: puede ser por URL param o por prop post
  const isEditing = Boolean(id) || Boolean(post?.id);
  const editingId = id || post?.id;

  console.log(
    "🔍 [BlogPostForm] Inicializando - URL ID:",
    id,
    "Post ID:",
    post?.id,
    "isEditing:",
    isEditing,
    "editingId:",
    editingId
  );

  // ✅ RTK Query Hooks
  const [createBlogPost, { isLoading: isCreating }] = useCreateBlogPostMutation();
  const [updateBlogPost, { isLoading: isUpdating }] = useUpdateBlogPostMutation();
  const [uploadFeaturedImage, { isLoading: isUploadingImage }] = useUploadFeaturedImageMutation();
  
  // Cargar post si estamos editando
  const { data: postData, isLoading: isLoadingPost } = useGetBlogPostByIdQuery(editingId, {
    skip: !isEditing || !editingId || Boolean(post), // Skip si no editamos o ya tenemos el post
  });

  // Obtener token de Redux
  const token = useSelector((state) => state.auth.token);

  const [formData, setFormData] = useState({
    title: "",
    author: "Administrador", // Agregar autor por defecto
    slug: "",
    excerpt: "",
    content: [],
    featuredImage: "",
    metaTitle: "",
    metaDescription: "",
    status: "draft",
    projectId: "", // Cambiar category por projectId
  });

  // ✅ NUEVO: Estado para manejar errores de validación
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Función para manejar el cierre/navegación según el contexto
  const handleClose = () => {
    if (onClose) {
      onClose(); // Si está en modo modal, usar la función de cierre
    } else {
      navigate("/admin/blog"); // Si está en página standalone, navegar
    }
  };

  // Función para manejar el éxito según el contexto
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess(); // Si está en modo modal, usar la función de éxito
    } else {
      navigate("/admin/blog"); // Si está en página standalone, navegar
    }
  };

  const [projects, setProjects] = useState([]); // Cambiar categories por projects
  const [showPreview, setShowPreview] = useState(false);
  const [editorInstance, setEditorInstance] = useState(null);
  const [editorData, setEditorData] = useState({ blocks: [] });

  // ✅ NUEVO: Persistencia temporal para evitar pérdida de datos
  useEffect(() => {
    // Solo guardar si estamos creando un nuevo post y hay datos
    if (!isEditing && (formData.title || formData.content.length > 0)) {
      const tempState = {
        formData,
        editorData
      };
      sessionStorage.setItem('blog_post_draft', JSON.stringify(tempState));
    }
  }, [formData, editorData, isEditing]);

  // Recuperar borrador al montar si es nuevo post
  useEffect(() => {
    if (!isEditing && !isInitialized) {
      const savedDraft = sessionStorage.getItem('blog_post_draft');
      if (savedDraft) {
        try {
          const { formData: savedFormData, editorData: savedEditorData } = JSON.parse(savedDraft);
          console.log("📦 Recuperando borrador guardado:", savedFormData);
          
          if (window.confirm("Hay un borrador guardado no publicado. ¿Deseas recuperarlo?")) {
            setFormData(savedFormData);
            setEditorData(savedEditorData);
          } else {
            sessionStorage.removeItem('blog_post_draft');
          }
        } catch (e) {
          console.error("Error recuperando borrador:", e);
        }
      }
      setIsInitialized(true);
    }
  }, [isEditing, isInitialized]);

  // Limpiar borrador al guardar exitosamente
  const clearDraft = () => {
    sessionStorage.removeItem('blog_post_draft');
  };

  // ✅ Combinar todos los estados de loading
  const loading = isCreating || isUpdating || isUploadingImage || isLoadingPost;

  // ✅ NUEVO: Usar hook para obtener proyectos disponibles
  const { data: projectsData, isLoading: loadingProjects } =
    useGetAvailableProjectsQuery();

  // ✅ NUEVO: Funciones de validación
  const validateField = (name, value) => {
    switch (name) {
      case "title":
        if (!value || value.trim().length === 0) {
          return "El título es requerido";
        }
        if (value.trim().length < 3) {
          return "El título debe tener al menos 3 caracteres";
        }
        if (value.trim().length > 200) {
          return "El título no puede exceder 200 caracteres";
        }
        return "";

      case "author":
        if (!value || value.trim().length === 0) {
          return "El autor es requerido";
        }
        if (value.trim().length < 2) {
          return "El nombre del autor debe tener al menos 2 caracteres";
        }
        if (value.trim().length > 100) {
          return "El nombre del autor no puede exceder 100 caracteres";
        }
        return "";

      case "slug":
        if (!value || value.trim().length === 0) {
          return "El slug es requerido";
        }
        if (!/^[a-z0-9-]+$/.test(value)) {
          return "El slug solo puede contener letras minúsculas, números y guiones";
        }
        if (value.length < 3) {
          return "El slug debe tener al menos 3 caracteres";
        }
        if (value.length > 200) {
          return "El slug no puede exceder 200 caracteres";
        }
        return "";

      case "excerpt":
        if (value && value.length > 300) {
          return "El extracto no puede exceder 300 caracteres";
        }
        return "";

      case "featuredImage":
        if (value) {
          if (typeof value === 'string') {
            if (!/^https?:\/\/.+/.test(value)) {
              return "La URL de la imagen debe ser válida (http/https)";
            }
          } else if (typeof value === 'object') {
            const url = value.url || value.desktop?.url;
            if (!url || !/^https?:\/\/.+/.test(url)) {
              return "El objeto de imagen no contiene una URL válida";
            }
          }
        }
        return "";

      case "metaTitle":
        if (value && value.length > 60) {
          return "El meta título no debe exceder 60 caracteres para SEO";
        }
        return "";

      case "metaDescription":
        if (value && value.length > 160) {
          return "La meta descripción no debe exceder 160 caracteres para SEO";
        }
        return "";

      default:
        return "";
    }
  };

  // ✅ MEJORADO: Validar todo el formulario (async para obtener datos del editor)
  const validateForm = async () => {
    const newErrors = {};

    // Validar campos básicos
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // ✅ MEJORADO: Obtener datos actuales del editor antes de validar
    let currentEditorData = editorData;
    if (editorInstance && editorInstance.save) {
      try {
        currentEditorData = await editorInstance.save();
        console.log("📝 [Validación] Datos del editor:", currentEditorData);
      } catch (error) {
        console.warn("⚠️ [Validación] Error obteniendo datos del editor:", error);
      }
    }

    // Validar contenido del editor
    if (!currentEditorData || !currentEditorData.blocks || currentEditorData.blocks.length === 0) {
      newErrors.content = "El contenido es requerido";
    } else {
      // Validar que haya al menos un bloque con contenido significativo
      const hasValidContent = currentEditorData.blocks.some((block) => {
        if (block.type === "paragraph" || block.type === "text") {
          const text = block.data?.text || block.value || "";
          return text.trim().length >= 10;
        }
        if (block.type === "header") {
          const text = block.data?.text || block.value || "";
          return text.trim().length > 0;
        }
        if (block.type === "list") {
          const items = block.data?.items || block.value || [];
          return Array.isArray(items) && items.length > 0;
        }
        return false;
      });

      if (!hasValidContent) {
        newErrors.content =
          "El contenido debe tener al menos un párrafo de texto con 10 caracteres o más";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ NUEVO: Manejar blur de campos (marcar como tocado)
  const handleFieldBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    // Validar solo este campo
    const error = validateField(fieldName, formData[fieldName]);
    setErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
  };

  // ✅ REFACTORIZADO: Cargar post desde postData (RTK Query) o desde prop
  useEffect(() => {
    console.log(
      "🔄 [BlogPostForm] useEffect - isEditing:",
      isEditing,
      "postData:",
      postData,
      "post prop:",
      post,
      "isInitialized:",
      isInitialized
    );

    if (isEditing && !isInitialized) {
      const sourcePost = postData?.data || post;
      if (sourcePost) {
        console.log("📝 Cargando datos del post para editar:", sourcePost);
        loadPostFromProp(sourcePost);
        setIsInitialized(true);
      }
    }
  }, [isEditing, postData, post, isInitialized]);

  // Nueva función para cargar post desde prop
  const loadPostFromProp = (postData) => {
    console.log("📝 [BlogPostForm] Cargando datos desde prop:", postData);

    setFormData({
      title: postData.title || "",
      author: postData.author || "Administrador",
      slug: postData.slug || "",
      excerpt: postData.excerpt || "",
      content: postData.content || [],
      featuredImage: postData.featuredImage || "",
      metaTitle: postData.metaTitle || "",
      metaDescription: postData.metaDescription || "",
      status: postData.status || "draft",
      projectId: postData.projectId || "",
    });

    // Convertir contenido del post al formato de Editor.js
    const editorContent = convertToEditorFormat(postData.content);
    console.log(
      "🔄 [BlogPostForm] Contenido convertido para editor desde prop:",
      editorContent
    );
    setEditorData(editorContent);
  };

  // Convertir de formato backend a formato Editor.js
  const convertToEditorFormat = (backendContent) => {
    console.log(
      "🔄 [BlogPostForm] Convirtiendo contenido backend:",
      backendContent
    );

    if (!backendContent || !Array.isArray(backendContent)) {
      console.log(
        "⚠️ [BlogPostForm] No hay contenido válido, usando bloques vacíos"
      );
      return { blocks: [] };
    }

    const blocks = backendContent.map((block, index) => {
      console.log(`🔄 [BlogPostForm] Procesando bloque ${index}:`, block);

      switch (block.type) {
        case "text":
          return {
            type: "paragraph",
            data: { text: block.value || "" },
          };
        case "header":
          return {
            type: "header",
            data: {
              text: block.value || "",
              level: block.level || 2,
            },
          };
        case "list":
          return {
            type: "list",
            data: {
              items: block.value || [],
              style: block.style || "unordered",
            },
          };
        case "quote":
          return {
            type: "quote",
            data: {
              text: block.value || "",
              caption: block.caption || "",
            },
          };
        case "image":
          return {
            type: "image",
            data: {
              file: { url: block.value || "" },
              caption: block.caption || "",
              withBorder: block.withBorder || false,
              withBackground: block.withBackground || false,
              stretched: block.stretched || false,
            },
          };
        case "delimiter":
          return {
            type: "delimiter",
            data: {},
          };
        case "embed":
          return {
            type: "embed",
            data: {
              source: block.value || "",
              service: block.service || "",
              caption: block.caption || "",
            },
          };
        default:
          return {
            type: "paragraph",
            data: { text: block.value || "" },
          };
      }
    });

    const result = { blocks };
    console.log("✅ [BlogPostForm] Contenido convertido:", result);
    return result;
  };

  // Manejar cambios en Editor.js
  const handleEditorChange = useCallback((data) => {
    console.log("📝 Editor cambió:", data);
    setEditorData(data);

    // ✅ Limpiar error de contenido cuando el editor cambia
    setErrors((prev) => {
      if (prev.content) {
        const newErrors = { ...prev };
        delete newErrors.content;
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Efecto para debuggear cambios en editorData
  useEffect(() => {
    console.log("🔍 [BlogPostForm] editorData cambió:", editorData);
  }, [editorData]);

  // Función para limpiar HTML del texto
  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Convertir contenido del Editor.js al formato del backend
  const convertToBackendFormat = (editorData) => {
    if (!editorData?.blocks) return [];

    return editorData.blocks.map((block) => {
      switch (block.type) {
        case "paragraph":
          // Limpiar HTML del texto si existe
          const cleanText = block.data?.text ? stripHtml(block.data.text) : "";
          return {
            type: "text",
            value: cleanText,
          };
        case "header":
          const cleanHeaderText = block.data?.text
            ? stripHtml(block.data.text)
            : "";
          return {
            type: "header",
            value: cleanHeaderText,
            level: block.data?.level || 2,
          };
        case "list":
          return {
            type: "list",
            value: block.data?.items || [],
            style: block.data?.style || "unordered",
          };
        case "quote":
          const cleanQuoteText = block.data?.text
            ? stripHtml(block.data.text)
            : "";
          return {
            type: "quote",
            value: cleanQuoteText,
            caption: block.data?.caption || "",
          };
        case "image":
          return {
            type: "image",
            value: block.data?.file?.url || "",
            caption: block.data?.caption || "",
            withBorder: block.data?.withBorder || false,
            withBackground: block.data?.withBackground || false,
            stretched: block.data?.stretched || false,
          };
        case "delimiter":
          return {
            type: "delimiter",
            value: "",
          };
        case "embed":
          return {
            type: "embed",
            value: block.data?.source || "",
            service: block.data?.service || "",
            caption: block.data?.caption || "",
          };
        default:
          const cleanDefaultText = block.data?.text
            ? stripHtml(block.data.text)
            : "";
          return {
            type: "text",
            value: cleanDefaultText,
          };
      }
    });
  };

  // ✅ REFACTORIZADO: Función para subir imagen destacada usando RTK Query
  const handleFeaturedImageUpload = useCallback(async (file) => {
    try {
      console.log("📸 Subiendo imagen destacada a Cloudinary:", file.name);

      // Guardar estado actual antes de subir por si acaso
      if (!isEditing) {
        const tempState = { formData, editorData };
        sessionStorage.setItem('blog_post_draft', JSON.stringify(tempState));
      }

      const formDataUpload = new FormData();
      formDataUpload.append("image", file);

      // ✅ Usar la mutación de RTK Query para imagen destacada
      const result = await uploadFeaturedImage(formDataUpload).unwrap();
      console.log("✅ Imagen destacada subida:", result);

      // Guardar el objeto completo de Cloudinary (no solo la URL)
      // El backend espera un objeto JSON con desktop, mobile, thumbnail, etc.
      const imageData = {
        desktop: result.desktop || { url: result.url },
        mobile: result.mobile || { url: result.url },
        thumbnail: result.thumbnail || { url: result.url },
        url: result.url || result.desktop?.url
      };
      console.log("🖼️ Objeto de imagen completo:", imageData);

      // Actualizar el campo de imagen destacada con el objeto completo
      setFormData((prev) => {
        const newState = {
          ...prev,
          featuredImage: imageData,
        };
        // Actualizar también el storage inmediatamente
        if (!isEditing) {
          const tempState = { formData: newState, editorData };
          sessionStorage.setItem('blog_post_draft', JSON.stringify(tempState));
        }
        return newState;
      });

      // ✅ Limpiar error de imagen si existe
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.featuredImage;
        return newErrors;
      });

      // No mostrar alert para no interrumpir flujo
      // alert("Imagen destacada subida exitosamente");
      return result;
    } catch (error) {
      console.error("❌ Error uploading featured image:", error);
      alert("Error al subir la imagen destacada: " + (error.message || JSON.stringify(error)));
    }
  }, [uploadFeaturedImage, isEditing, formData, editorData]);

  // ✅ REFACTORIZADO: Función para subir imágenes del contenido del editor
  const handleImageUpload = useCallback(async (file) => {
    try {
      console.log("📸 Subiendo imagen del contenido (editor):", file.name);

      const formData = new FormData();
      formData.append("image", file);

      // ✅ Usar endpoint diferente para imágenes del contenido
      // Usamos /blog/new/upload-image que guardará en blog/YYYY/uploads
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const headers = {};
      if (token) {
        headers["authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${baseUrl}/blog/new/upload-image`, {
        method: "POST",
        body: formData,
        headers: headers,
      });

      if (!response.ok) {
        console.error("❌ Error subiendo imagen del contenido - Status:", response.status);
        // Fallback: crear URL temporal para la imagen
        const url = URL.createObjectURL(file);
        return { url };
      }

      const result = await response.json();
      console.log("✅ Imagen del contenido subida:", result);

      // Extraer la URL correcta del resultado de Cloudinary
      const imageUrl = result.desktop?.url || result.data?.desktop?.url || result.url || "";
      return { url: imageUrl };
    } catch (error) {
      console.error("Error uploading image:", error);
      // Fallback: crear URL temporal para la imagen
      const url = URL.createObjectURL(file);
      return { url };
    }
  }, [token]);

  // ✅ MEJORADO: Generar slug automáticamente y hacerlo más robusto
  const generateSlug = (title) => {
    return (
      title
        .toLowerCase()
        .trim()
        // Reemplazar caracteres especiales y acentos
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        // Mantener solo letras, números y espacios
        .replace(/[^a-z0-9\s-]/g, "")
        // Reemplazar espacios múltiples con uno solo
        .replace(/\s+/g, " ")
        // Reemplazar espacios con guiones
        .replace(/\s/g, "-")
        // Reemplazar guiones múltiples con uno solo
        .replace(/-+/g, "-")
        // Remover guiones al inicio y final
        .replace(/^-+|-+$/g, "")
    );
  };

  // ✅ MEJORADO: Manejar cambios en inputs con validación en tiempo real
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // ✅ MEJORADO: Solo regenerar slug si estamos en modo creación
      ...(name === "title" && !isEditing && { slug: generateSlug(value) }),
    }));

    // ✅ NUEVO: Validar en tiempo real si el campo ya fue tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  // ✅ MEJORADO: Enviar formulario con validación completa
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ NUEVO: Marcar todos los campos como tocados
    const allFields = Object.keys(formData);
    const newTouched = {};
    allFields.forEach((field) => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    // ✅ MEJORADO: Validar todo el formulario antes de enviar (ahora es async)
    const isValid = await validateForm();
    if (!isValid) {
      alert(
        "Por favor corrige los errores en el formulario antes de continuar"
      );
      return;
    }

    try {
      // Si hay una instancia del editor, obtener los datos actuales
      let currentEditorData = editorData;
      if (editorInstance && editorInstance.save) {
        try {
          currentEditorData = await editorInstance.save();
          console.log(
            "📝 Datos obtenidos directamente del editor:",
            currentEditorData
          );
        } catch (error) {
          console.warn(
            "⚠️ No se pudieron obtener datos del editor, usando estado actual:",
            error
          );
        }
      }

      // Convertir contenido del editor al formato del backend
      const backendContent = convertToBackendFormat(currentEditorData);

      // ✅ CORRECCIÓN CRÍTICA: Asegurar que featuredImage tenga el formato correcto
      let finalFeaturedImage = formData.featuredImage;
      
      console.log("🔍 [BlogPostForm] featuredImage antes de procesar:", finalFeaturedImage);

      // Si es un string (URL) y no está vacío, convertirlo a objeto
      if (typeof finalFeaturedImage === 'string' && finalFeaturedImage.trim() !== '') {
        console.log("⚠️ featuredImage es string, convirtiendo a objeto:", finalFeaturedImage);
        finalFeaturedImage = {
          desktop: { url: finalFeaturedImage },
          mobile: { url: finalFeaturedImage },
          thumbnail: { url: finalFeaturedImage },
          url: finalFeaturedImage
        };
      } else if (finalFeaturedImage && typeof finalFeaturedImage === 'object') {
        // Asegurar que tenga la estructura mínima requerida
        console.log("✅ featuredImage es objeto, verificando estructura:", finalFeaturedImage);
        if (!finalFeaturedImage.url && finalFeaturedImage.desktop?.url) {
            finalFeaturedImage.url = finalFeaturedImage.desktop.url;
        }
      } else {
        console.log("⚠️ featuredImage es null o inválido:", finalFeaturedImage);
      }

      const submitData = {
        ...formData,
        featuredImage: finalFeaturedImage,
        content: backendContent,
      };

      console.log("📤 Enviando datos finales al backend:", JSON.stringify(submitData, null, 2));

      // ✅ REFACTORIZADO: Usar mutaciones de RTK Query
      let result;
      if (isEditing) {
        console.log("✏️ Actualizando post existente, ID:", editingId);
        result = await updateBlogPost({ id: editingId, ...submitData }).unwrap();
      } else {
        console.log("📝 Creando nuevo post");
        result = await createBlogPost(submitData).unwrap();
      }

      console.log("✅ Post guardado:", result);
      clearDraft(); // Limpiar borrador
      handleSuccess();
    } catch (error) {
      console.error("❌ Error saving blog post:", error);
      const errorMessage = error?.data?.message || error?.message || "Error desconocido";
      alert("Error al guardar el post: " + errorMessage);
    }
  };

  // ✅ NUEVO: Componente para mostrar errores de validación
  const ErrorMessage = ({ error }) => {
    if (!error) return null;

    return (
      <div className="flex items-center mt-1 text-red-600 text-sm">
        <FiAlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  };

  // ✅ NUEVO: Función para obtener clases CSS de input basadas en estado de validación
  const getInputClasses = (fieldName) => {
    const baseClasses =
      "w-full px-3 py-2 border rounded-md focus:outline-none transition-colors";
    const hasError = touched[fieldName] && errors[fieldName];

    if (hasError) {
      return `${baseClasses} border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500`;
    }

    return `${baseClasses} border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`;
  };

  // Renderizar preview de bloques
  const renderPreviewBlock = (block) => {
    switch (block.type) {
      case "text":
        return (
          <p className="mb-4 text-gray-700 leading-relaxed">{block.value}</p>
        );
      case "header":
        const HeaderTag = `h${block.level || 2}`;
        const headerClasses = {
          1: "text-3xl font-bold mb-6",
          2: "text-2xl font-bold mb-4",
          3: "text-xl font-bold mb-3",
          4: "text-lg font-bold mb-2",
          5: "text-base font-bold mb-2",
          6: "text-sm font-bold mb-2",
        };
        return (
          <HeaderTag
            className={`${headerClasses[block.level || 2]} text-gray-900`}
          >
            {block.value}
          </HeaderTag>
        );
      case "list":
        const ListTag = block.style === "ordered" ? "ol" : "ul";
        const listClass =
          block.style === "ordered" ? "list-decimal" : "list-disc";
        return (
          <ListTag className={`${listClass} pl-6 mb-4 space-y-2`}>
            {Array.isArray(block.value) &&
              block.value.map((item, idx) => (
                <li key={idx} className="text-gray-700">
                  {item}
                </li>
              ))}
          </ListTag>
        );
      case "quote":
        return (
          <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-gray-50">
            <p className="text-gray-700 italic mb-2">{block.value}</p>
            {block.caption && (
              <cite className="text-sm text-gray-500">— {block.caption}</cite>
            )}
          </blockquote>
        );
      case "image":
        return (
          <figure className="mb-6">
            <img
              src={block.value}
              alt={block.caption || ""}
              className={`max-w-full h-auto mx-auto ${
                block.withBorder ? "border border-gray-300" : ""
              } ${block.withBackground ? "bg-gray-100 p-4" : ""} ${
                block.stretched ? "w-full" : ""
              }`}
            />
            {block.caption && (
              <figcaption className="text-center text-sm text-gray-600 mt-2">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );
      case "delimiter":
        return (
          <div className="text-center my-8">
            <span className="text-2xl text-gray-400">* * *</span>
          </div>
        );
      case "embed":
        return (
          <div className="mb-6">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">
                Contenido embebido: {block.service}
              </p>
            </div>
            {block.caption && (
              <p className="text-center text-sm text-gray-600 mt-2">
                {block.caption}
              </p>
            )}
          </div>
        );
      default:
        return <p className="mb-4 text-gray-700">{block.value}</p>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleClose}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiArrowLeft className="mr-2" />
            Volver al blog
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Editar Post" : "Crear Nuevo Post"}
          </h1>
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FiEye className="mr-2" />
            {showPreview ? "Ocultar Preview" : "Ver Preview"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario principal */}
        <div className={`${showPreview ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Información básica</h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur("title")}
                    className={getInputClasses("title")}
                    required
                    placeholder="Ingresa el título del post"
                  />
                  <ErrorMessage error={touched.title ? errors.title : ""} />
                </div>

                <div>
                  <label
                    htmlFor="author"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Autor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur("author")}
                    className={getInputClasses("author")}
                    required
                    placeholder="Nombre del autor"
                  />
                  <ErrorMessage error={touched.author ? errors.author : ""} />
                </div>

                <div>
                  <label
                    htmlFor="slug"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Slug <span className="text-red-500">*</span>
                    {!isEditing && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Se genera automáticamente desde el título)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur("slug")}
                    className={`${getInputClasses("slug")} ${
                      !isEditing ? "bg-gray-50" : ""
                    }`}
                    readOnly={!isEditing}
                    required
                    placeholder="url-amigable-del-post"
                  />
                  <ErrorMessage error={touched.slug ? errors.slug : ""} />
                  {!isEditing && (
                    <p className="text-xs text-gray-500 mt-1">
                      El slug se genera automáticamente cuando escribes el
                      título
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="excerpt"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Extracto
                    <span className="text-xs text-gray-500 ml-2">
                      (Opcional, máx. 300 caracteres)
                    </span>
                  </label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur("excerpt")}
                    rows="3"
                    className={getInputClasses("excerpt")}
                    placeholder="Breve descripción del post..."
                    maxLength="300"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <ErrorMessage
                      error={touched.excerpt ? errors.excerpt : ""}
                    />
                    <span className="text-xs text-gray-400">
                      {formData.excerpt.length}/300
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="projectId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Proyecto Relacionado (Opcional)
                  </label>
                  <select
                    id="projectId"
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur("projectId")}
                    className={getInputClasses("projectId")}
                    disabled={loadingProjects}
                  >
                    <option value="">Sin proyecto relacionado</option>
                    {projectsData?.data?.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title} ({project.year}) -{" "}
                        {project.location || "Sin ubicación"}
                      </option>
                    ))}
                  </select>
                  {loadingProjects && (
                    <p className="text-sm text-blue-500 mt-1">
                      Cargando proyectos disponibles...
                    </p>
                  )}
                  {!loadingProjects &&
                    (!projectsData?.data || projectsData.data.length === 0) && (
                      <p className="text-sm text-gray-500 mt-1">
                        No hay proyectos disponibles. Los posts pueden crearse
                        sin relacionar a un proyecto.
                      </p>
                    )}
                  {!loadingProjects &&
                    projectsData?.data &&
                    projectsData.data.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {projectsData.data.length} proyecto
                        {projectsData.data.length !== 1 ? "s" : ""} disponible
                        {projectsData.data.length !== 1 ? "s" : ""}
                      </p>
                    )}
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Estado <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur("status")}
                    className={getInputClasses("status")}
                    required
                  >
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                  </select>
                  <ErrorMessage error={touched.status ? errors.status : ""} />
                </div>

                <div>
                  <label
                    htmlFor="featuredImage"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Imagen destacada
                  </label>
                  <div className="space-y-3">
                    <input
                      type="url"
                      id="featuredImage"
                      name="featuredImage"
                      value={
                        typeof formData.featuredImage === 'object' 
                          ? (formData.featuredImage?.desktop?.url || formData.featuredImage?.url || '')
                          : (formData.featuredImage || '')
                      }
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur("featuredImage")}
                      className={getInputClasses("featuredImage")}
                      placeholder="https://ejemplo.com/imagen.jpg o sube una nueva"
                    />
                    <ErrorMessage
                      error={touched.featuredImage ? errors.featuredImage : ""}
                    />

                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">o</span>
                      <label className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleFeaturedImageUpload(file);
                            }
                          }}
                        />
                        📸 Subir imagen
                      </label>
                    </div>

                    {formData.featuredImage && (
                      <div className="mt-3">
                        <img
                          src={
                            typeof formData.featuredImage === 'object'
                              ? (formData.featuredImage?.desktop?.url || formData.featuredImage?.url || '')
                              : formData.featuredImage
                          }
                          alt="Preview imagen destacada"
                          className="w-full max-w-xs h-auto border rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Editor de contenido */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Contenido <span className="text-red-500">*</span>
                </h2>
                {errors.content && (
                  <div className="flex items-center text-red-600 text-sm">
                    <FiAlertCircle className="w-4 h-4 mr-1" />
                    <span>{errors.content}</span>
                  </div>
                )}
              </div>
              <EditorJSComponent
                key={`editor-${editingId || "new"}`} // Solo reiniciar cuando cambie el post que estamos editando
                data={editorData}
                onChange={handleEditorChange}
                onImageUpload={handleImageUpload}
                onReady={(editor) => {
                  console.log("📝 Editor instancia recibida:", editor);
                  setEditorInstance(editor);
                }}
              />
            </div>

            {/* SEO */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">SEO (Opcional)</h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="metaTitle"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Meta Título
                    <span className="text-xs text-gray-500 ml-2">
                      (Recomendado: máx. 60 caracteres)
                    </span>
                  </label>
                  <input
                    type="text"
                    id="metaTitle"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur("metaTitle")}
                    className={getInputClasses("metaTitle")}
                    placeholder="Título optimizado para motores de búsqueda"
                    maxLength="60"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <ErrorMessage
                      error={touched.metaTitle ? errors.metaTitle : ""}
                    />
                    <span className="text-xs text-gray-400">
                      {formData.metaTitle.length}/60
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="metaDescription"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Meta Descripción
                    <span className="text-xs text-gray-500 ml-2">
                      (Recomendado: máx. 160 caracteres)
                    </span>
                  </label>
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur("metaDescription")}
                    rows="3"
                    className={getInputClasses("metaDescription")}
                    placeholder="Descripción del post que aparecerá en los resultados de búsqueda"
                    maxLength="160"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <ErrorMessage
                      error={
                        touched.metaDescription ? errors.metaDescription : ""
                      }
                    />
                    <span className="text-xs text-gray-400">
                      {formData.metaDescription.length}/160
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <FiSave className="mr-2" />
                {loading
                  ? "Guardando..."
                  : isEditing
                  ? "Actualizar"
                  : "Crear Post"}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Vista Previa</h2>
              <div className="prose prose-sm max-w-none">
                <h1 className="text-xl font-bold mb-4">
                  {formData.title || "Título del post"}
                </h1>
                {formData.excerpt && (
                  <p className="text-gray-600 italic mb-4">
                    {formData.excerpt}
                  </p>
                )}
                <div className="border-t pt-4">
                  {convertToBackendFormat(editorData).map((block, index) => (
                    <div key={index}>{renderPreviewBlock(block)}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// ✅ Agregar displayName para debugging
BlogPostForm.displayName = 'BlogPostForm';

export default BlogPostForm;
