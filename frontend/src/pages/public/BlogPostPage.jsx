import React, { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useGetBlogPostBySlugQuery, useGetBlogPostsQuery } from '../../features/blog';
import { Helmet } from 'react-helmet-async';
// import { VideoGallery } from '../../components/ui/VideoPlayer';
import { MdDateRange, MdPerson, MdLocalOffer, MdVisibility, MdArrowBack, MdShare } from 'react-icons/md';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const BlogPostPage = () => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const { slug } = useParams();
  const { 
    data: postResponse, 
    isLoading, 
    error 
  } = useGetBlogPostBySlugQuery(slug);

  const { 
    data: relatedPostsResponse 
  } = useGetBlogPostsQuery({ 
    limit: 3, 
    featured: true 
  });

  const post = postResponse?.data?.post;
  const relatedPosts = postResponse?.data?.relatedPosts || relatedPostsResponse?.data || [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getImageUrl = (post) => {
    if (!post.featuredImage) return null;
    
    if (typeof post.featuredImage === 'object') {
      return post.featuredImage.desktop?.url ||
             post.featuredImage.mobile?.url ||
             post.featuredImage.thumbnail?.url ||
             post.featuredImage.url ||
             null;
    }

    if (typeof post.featuredImage === 'string') {
      return post.featuredImage;
    }

    return null;
  };

  // Función para renderizar el contenido de Editor.js
  const renderContent = (content) => {
    if (!content || !Array.isArray(content)) {
      return <p className="text-gray-600">No hay contenido disponible.</p>;
    }

    return content.map((block, index) => {
      switch (block.type) {
        case 'text':
          return (
            <p key={index} className="mb-6 text-gray-700 leading-relaxed text-lg">
              {block.value}
            </p>
          );
        
        case 'header':
          const HeaderTag = `h${block.level || 2}`;
          const headerClasses = {
            1: 'text-4xl font-bold mb-8 mt-12',
            2: 'text-3xl font-bold mb-6 mt-10',
            3: 'text-2xl font-bold mb-4 mt-8',
            4: 'text-xl font-bold mb-3 mt-6',
            5: 'text-lg font-bold mb-2 mt-4',
            6: 'text-base font-bold mb-2 mt-4'
          };
          return (
            <HeaderTag key={index} className={`${headerClasses[block.level || 2]} text-gray-900`}>
              {block.value}
            </HeaderTag>
          );
        
        case 'list':
          const ListTag = block.style === 'ordered' ? 'ol' : 'ul';
          const listClass = block.style === 'ordered' ? 'list-decimal' : 'list-disc';
          return (
            <ListTag key={index} className={`${listClass} pl-6 mb-6 space-y-2`}>
              {Array.isArray(block.value) && block.value.map((item, idx) => (
                <li key={idx} className="text-gray-700 text-lg leading-relaxed">{item}</li>
              ))}
            </ListTag>
          );
        
        case 'quote':
          return (
            <blockquote key={index} className="border-l-4 border-blue-500 pl-6 py-4 mb-8 bg-gray-50">
              <p className="text-gray-700 italic text-lg mb-2">{block.value}</p>
              {block.caption && (
                <cite className="text-sm text-gray-500">— {block.caption}</cite>
              )}
            </blockquote>
          );
        
        case 'image':
          return (
            <figure key={index} className="mb-8">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={block.value} 
                  alt={block.caption || ''}
                  className={`w-full h-full object-cover ${
                    block.withBorder ? 'border border-gray-300' : ''
                  } ${
                    block.withBackground ? 'bg-gray-100 p-4' : ''
                  }`}
                  onError={(e) => {
                    // Evitar bucle infinito verificando si ya es la imagen por defecto
                    if (!e.target.src.includes('data:image')) {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4Ij5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD4KPC9zdmc+';
                    }
                  }}
                />
              </div>
              {block.caption && (
                <figcaption className="text-center text-sm text-gray-600 mt-3">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        
        case 'delimiter':
          return (
            <div key={index} className="text-center my-12">
              <span className="text-3xl text-gray-400">* * *</span>
            </div>
          );
        
        case 'embed':
          return (
            <div key={index} className="mb-8">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Contenido embebido: {block.service}</p>
              </div>
              {block.caption && (
                <p className="text-center text-sm text-gray-600 mt-3">{block.caption}</p>
              )}
            </div>
          );
        
        default:
          return (
            <p key={index} className="mb-6 text-gray-700 leading-relaxed text-lg">
              {block.value || ''}
            </p>
          );
      }
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="aspect-[16/9] bg-gray-200 rounded"></div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !post) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{post.title} - Blog Divanco</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={getImageUrl(post)} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={getImageUrl(post)} />
      </Helmet>

      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900 transition-colors duration-200">
              Inicio
            </Link>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-gray-900 transition-colors duration-200">
              Blog
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium truncate">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <header className="mb-12">
          <div className="space-y-6">
            {/* Meta info */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
              {post.author && (
                <>
                  <span>•</span>
                  <span>Por {post.author}</span>
                </>
              )}
              {post.tags && post.tags.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex gap-2">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-light text-gray-900 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && getImageUrl(post) && (
          <div className="mb-12">
            <div className="overflow-hidden bg-gray-100 rounded-lg">
              <img
                src={getImageUrl(post)}
                alt={post.title}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg prose-gray max-w-none">
          {renderContent(post.content)}
        </div>

        {/* Image Gallery */}
        {post.images && post.images.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Galería de Imágenes</h3>
            <div className={`grid gap-4 ${
              post.images.length === 1 ? 'grid-cols-1' : 
              post.images.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {post.images.map((image, index) => {
                const imgUrl = image.desktop?.url || image.mobile?.url || image.thumbnail?.url || '/images/blog/default-blog.jpg';
                return (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={image.alt || `Imagen ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                      onClick={() => {
                        setGalleryIndex(index);
                        setGalleryOpen(true);
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Modal Gallery */}
            {galleryOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
                <div className="absolute inset-0" onClick={() => setGalleryOpen(false)} />
                <div className="relative max-w-3xl w-full mx-4">
                  <button
                    className="absolute top-2 right-2 z-10 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100 transition"
                    onClick={() => setGalleryOpen(false)}
                    aria-label="Cerrar galería"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-700">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <Swiper
                    modules={[Navigation, Pagination]}
                    navigation
                    pagination={{ clickable: true }}
                    keyboard={{ enabled: true }}
                    initialSlide={galleryIndex}
                    className="rounded-lg bg-white"
                  >
                    {post.images.map((image, idx) => {
                      const imgUrl = image.desktop?.url || image.mobile?.url || image.thumbnail?.url || '/images/blog/default-blog.jpg';
                      return (
                        <SwiperSlide key={idx}>
                          <div className="flex items-center justify-center min-h-[60vw] max-h-[80vh]">
                            <img
                              src={imgUrl}
                              alt={image.alt || `Imagen ${idx + 1}`}
                              className="max-h-[80vh] w-auto max-w-full object-contain mx-auto"
                            />
                          </div>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Video Gallery - Temporalmente deshabilitado */}
        {post.videos && post.videos.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Videos</h3>
            <div className="grid gap-4">
              {post.videos.map((video, index) => (
                <div key={video.id || index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    src={video.url}
                    controls
                    className="w-full h-full object-cover"
                    poster={video.thumbnail}
                  >
                    Tu navegador no soporta videos.
                  </video>
                  {video.title && (
                    <p className="text-sm text-gray-600 mt-2">{video.title}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Project */}
        {post.project && (
          <div className="mt-16 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Proyecto Relacionado
            </h3>
            <Link 
              to={`/proyectos/${post.project.slug}`}
              className="block group"
            >
              <div className="flex items-center gap-4">
                {post.project.featuredImage && (
                  <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={post.project.featuredImage?.urls?.thumbnail || post.project.featuredImage?.urls?.desktop}
                      alt={post.project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors duration-200">
                    {post.project.title}
                  </h4>
                  <p className="text-sm text-gray-600">{post.project.year}</p>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Share buttons */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Compartir este artículo
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigator.share ? 
                      navigator.share({ title: post.title, url: window.location.href }) :
                      navigator.clipboard.writeText(window.location.href);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors duration-200"
                >
                  Compartir
                </button>
                <button
                  onClick={() => {
                    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`;
                    window.open(url, '_blank');
                  }}
                  className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors duration-200"
                >
                  Twitter
                </button>
              </div>
            </div>
            <Link
              to="/blog"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              ← Volver al blog
            </Link>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-light text-gray-900 mb-8">
              Artículos Relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.slice(0, 3).map((relatedPost) => {
                const imageUrl = getImageUrl(relatedPost);
                if (!imageUrl) return null; // No mostrar posts sin imagen
                
                return (
                <article key={relatedPost.id} className="group">
                  <Link to={`/blog/${relatedPost.slug}`} className="block">
                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100 mb-4 rounded">
                      <img
                        src={imageUrl}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <time className="text-xs font-medium text-gray-500 tracking-wider uppercase">
                        {formatDate(relatedPost.publishedAt)}
                      </time>
                      <h3 className="text-lg font-light text-gray-900 leading-tight group-hover:text-gray-600 transition-colors duration-200">
                        {relatedPost.title}
                      </h3>
                      {relatedPost.excerpt && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogPostPage;