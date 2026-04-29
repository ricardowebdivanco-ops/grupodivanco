import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import ImageTool from '@editorjs/image';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import Embed from '@editorjs/embed';

const EditorJSComponent = ({ 
  data = null, 
  onChange, 
  onImageUpload,
  onReady,
  placeholder = "Escribe tu contenido aquí..."
}) => {
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const onChangeRef = useRef(onChange);
  const dataRef = useRef(data);

  // Actualizar ref cuando onChange cambie
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Función para crear una nueva instancia del editor
  const createEditor = (initialData) => {
    if (!editorRef.current) return null;

    console.log('🏗️ [EditorJS] Creando nueva instancia con datos:', initialData);

    const editorInstance = new EditorJS({
      holder: editorRef.current,
      placeholder: placeholder,
      data: initialData || {
        blocks: []
      },
      tools: {
        header: {
          class: Header,
          config: {
            levels: [2, 3, 4],
            defaultLevel: 2,
            placeholder: 'Escribe un título...'
          }
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
          config: {
            placeholder: 'Escribe tu texto aquí...'
          }
        },
        list: {
          class: List,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered'
          }
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: 'Escribe una cita...',
            captionPlaceholder: 'Autor de la cita'
          }
        },
        delimiter: {
          class: Delimiter
        },
        embed: {
          class: Embed,
          config: {
            services: {
              youtube: true,
              instagram: true,
              twitter: true,
              vimeo: true,
              facebook: true,
              tiktok: true
            }
          }
        },
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: async (file) => {
                if (onImageUpload) {
                  try {
                    const result = await onImageUpload(file);
                    return {
                      success: 1,
                      file: {
                        url: result.url || result.secure_url,
                        caption: '',
                        withBorder: false,
                        withBackground: false,
                        stretched: false
                      }
                    };
                  } catch (error) {
                    console.error('Error uploading image:', error);
                    return {
                      success: 0,
                      message: 'Error al subir la imagen'
                    };
                  }
                }
                return {
                  success: 0,
                  message: 'Función de subida no disponible'
                };
              }
            },
            placeholder: 'Arrastra una imagen aquí o haz clic para seleccionar'
          }
        }
      },
      onChange: async () => {
        console.log('🔄 [EditorJS] onChange disparado, isReady:', isReady);
        // Solo proceder si el editor está listo
        if (isReady && onChangeRef.current && editorInstance) {
          try {
            console.log('💾 [EditorJS] Guardando datos del editor...');
            const outputData = await editorInstance.save();
            console.log('📤 [EditorJS] Datos guardados:', outputData);
            onChangeRef.current(outputData);
          } catch (error) {
            console.error('❌ [EditorJS] Error saving editor data:', error);
          }
        } else {
          console.log('⚠️ [EditorJS] onChange ignorado - editor no listo o onChange no disponible');
        }
      },
      onReady: () => {
        console.log('✅ [EditorJS] Editor listo para usar');
        // Dar un pequeño tiempo para que el editor se estabilice
        setTimeout(() => {
          setIsReady(true);
          console.log('📝 Editor.js está listo');
          if (onReady && typeof onReady === 'function') {
            onReady(editorInstance);
          }
        }, 200);
      }
    });

    return editorInstance;
  };

  // Efecto principal para manejar la creación del editor (SOLO UNA VEZ)
  useEffect(() => {
    console.log('🔄 [EditorJS] Efecto principal disparado. Data:', data);
    
    // Si ya hay un editor, no hacer nada (dejarlo vivir)
    if (editor) {
      console.log('⏭️ [EditorJS] Editor ya existe, saltando creación');
      return;
    }

    // Crear nueva instancia con un pequeño delay para asegurar que el DOM esté limpio
    const timer = setTimeout(() => {
      const newEditor = createEditor(data);
      if (newEditor) {
        setEditor(newEditor);
        dataRef.current = data;
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []); // ✅ Solo crear el editor una vez al montar el componente

  // ✅ NUEVO: Efecto para actualizar contenido cuando cambia data (modo edición)
  useEffect(() => {
    // Solo actualizar si:
    // 1. El editor existe y está listo
    // 2. Los datos nuevos son diferentes de los actuales
    // 3. Los datos nuevos tienen contenido válido
    if (editor && isReady && data && data.blocks && data.blocks.length > 0) {
      const isDifferent = JSON.stringify(data) !== JSON.stringify(dataRef.current);
      
      if (isDifferent) {
        console.log('🔄 [EditorJS] Datos cambiaron, actualizando editor con:', data);
        dataRef.current = data;
        
        // Usar el método render de EditorJS para actualizar el contenido
        editor.render(data).then(() => {
          console.log('✅ [EditorJS] Contenido actualizado exitosamente');
        }).catch((error) => {
          console.error('❌ [EditorJS] Error actualizando contenido:', error);
        });
      }
    }
  }, [data, editor, isReady]);

  // Efecto de limpieza al desmontar
  useEffect(() => {
    return () => {
      if (editor && typeof editor.destroy === 'function') {
        console.log('🗑️ [EditorJS] Limpieza final - destruyendo editor');
        editor.destroy();
      }
    };
  }, [editor]);

  return (
    <div className="border border-gray-300 rounded-md">
      <div 
        ref={editorRef}
        className="min-h-[300px] p-4 prose max-w-none"
        style={{
          fontSize: '16px',
          lineHeight: '1.6'
        }}
      />
    </div>
  );
};

export default EditorJSComponent;
