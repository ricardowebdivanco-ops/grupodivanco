import { useState, useEffect, useRef } from 'react';
import { useTranslation } from './useTranslation';

/**
 * Hook para manejar la traducción automática de listas de posts
 * Traduce solo los campos principales para listas (título y excerpt)
 */
export const useTranslatedBlogPosts = (originalPosts) => {
  const { currentLanguage, translateDynamic } = useTranslation();
  const [translatedPosts, setTranslatedPosts] = useState(originalPosts);
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Ref para evitar loops infinitos
  const lastProcessedRef = useRef(null);

  useEffect(() => {
    // Crear un identificador único para este conjunto de posts y idioma
    const postsId = originalPosts ? JSON.stringify(originalPosts.map(p => p.id)) : null;
    const currentId = `${postsId}-${currentLanguage}`;
    
    // Si ya procesamos estos posts en este idioma, no hacer nada
    if (lastProcessedRef.current === currentId) {
      return;
    }

    if (!originalPosts || !Array.isArray(originalPosts) || currentLanguage === 'es') {
      // Si no hay posts, no es array, o estamos en español, usar originales
      setTranslatedPosts(originalPosts);
      lastProcessedRef.current = currentId;
      return;
    }

    // Si no hay posts para traducir, salir
    if (originalPosts.length === 0) {
      setTranslatedPosts(originalPosts);
      lastProcessedRef.current = currentId;
      return;
    }

    const translatePosts = async () => {
      setIsTranslating(true);
      
      try {
        console.log(`🔄 Traduciendo ${originalPosts.length} posts`);
        
        const translated = await Promise.all(
          originalPosts.map(async (post) => {
            const translatedPost = { ...post };

            // Solo traducir título y excerpt para listas (performance)
            if (post.title) {
              translatedPost.title = await translateDynamic(
                post.title, 
                `post-list-title-${post.id}`
              );
            }

            if (post.excerpt) {
              translatedPost.excerpt = await translateDynamic(
                post.excerpt, 
                `post-list-excerpt-${post.id}`
              );
            }

            return translatedPost;
          })
        );

        console.log(`✅ ${translated.length} posts traducidos`);
        setTranslatedPosts(translated);
        lastProcessedRef.current = currentId;
        
      } catch (error) {
        console.error('❌ Error traduciendo posts:', error);
        // En caso de error, mantener los posts originales
        setTranslatedPosts(originalPosts);
        lastProcessedRef.current = currentId;
      } finally {
        setIsTranslating(false);
      }
    };

    translatePosts();
  }, [originalPosts, currentLanguage]); // Removemos translateDynamic de las dependencias

  return {
    posts: translatedPosts,
    isTranslating,
    originalPosts
  };
};
