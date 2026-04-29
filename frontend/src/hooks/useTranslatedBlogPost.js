import { useState, useEffect } from 'react';
import { useTranslation } from './useTranslation';

/**
 * Hook para manejar la traducción automática de posts de blog
 * Traduce título, excerpt, contenido y meta datos cuando el idioma cambia
 */
export const useTranslatedBlogPost = (originalPost) => {
  const { currentLanguage, translateDynamic } = useTranslation();
  const [translatedPost, setTranslatedPost] = useState(originalPost);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!originalPost || currentLanguage === 'es') {
      // Si no hay post o estamos en español (idioma base), usar el original
      setTranslatedPost(originalPost);
      return;
    }

    const translatePost = async () => {
      setIsTranslating(true);
      
      try {
        console.log('🔄 Traduciendo post:', originalPost.title);
        
        // Crear una copia del post original
        const translated = { ...originalPost };

        // Traducir campos de texto principales
        if (originalPost.title) {
          translated.title = await translateDynamic(originalPost.title, `post-title-${originalPost.id}`);
        }

        if (originalPost.excerpt) {
          translated.excerpt = await translateDynamic(originalPost.excerpt, `post-excerpt-${originalPost.id}`);
        }

        if (originalPost.metaTitle) {
          translated.metaTitle = await translateDynamic(originalPost.metaTitle, `post-meta-title-${originalPost.id}`);
        }

        if (originalPost.metaDescription) {
          translated.metaDescription = await translateDynamic(originalPost.metaDescription, `post-meta-desc-${originalPost.id}`);
        }

        // Traducir contenido (bloques de Editor.js)
        if (originalPost.content && Array.isArray(originalPost.content)) {
          translated.content = await Promise.all(
            originalPost.content.map(async (block, index) => {
              const translatedBlock = { ...block };
              
              switch (block.type) {
                case 'text':
                  if (block.value) {
                    translatedBlock.value = await translateDynamic(
                      block.value, 
                      `post-content-text-${originalPost.id}-${index}`
                    );
                  }
                  break;
                
                case 'header':
                  if (block.value) {
                    translatedBlock.value = await translateDynamic(
                      block.value, 
                      `post-content-header-${originalPost.id}-${index}`
                    );
                  }
                  break;
                
                case 'list':
                  if (block.items && Array.isArray(block.items)) {
                    translatedBlock.items = await Promise.all(
                      block.items.map(async (item, itemIndex) => 
                        await translateDynamic(
                          item, 
                          `post-content-list-${originalPost.id}-${index}-${itemIndex}`
                        )
                      )
                    );
                  }
                  break;
                
                case 'quote':
                  if (block.text) {
                    translatedBlock.text = await translateDynamic(
                      block.text, 
                      `post-content-quote-${originalPost.id}-${index}`
                    );
                  }
                  if (block.caption) {
                    translatedBlock.caption = await translateDynamic(
                      block.caption, 
                      `post-content-quote-caption-${originalPost.id}-${index}`
                    );
                  }
                  break;
                
                default:
                  // Para otros tipos de bloques (image, delimiter, etc.) no traducir
                  break;
              }
              
              return translatedBlock;
            })
          );
        }

        console.log('✅ Post traducido:', translated.title);
        setTranslatedPost(translated);
        
      } catch (error) {
        console.error('❌ Error traduciendo post:', error);
        // En caso de error, mantener el post original
        setTranslatedPost(originalPost);
      } finally {
        setIsTranslating(false);
      }
    };

    translatePost();
  }, [originalPost, currentLanguage, translateDynamic]);

  return {
    post: translatedPost,
    isTranslating,
    originalPost
  };
};
