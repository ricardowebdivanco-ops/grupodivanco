
import { EdicionesPage, Hero, SloganPage } from '../../components/layout/public';
import ProjectSection from '../../components/SectionHomePage/ProjectSection';
import ShowroomSection from '../../components/SectionHomePage/ShowroomSection';
import BlogSectionNew from '../../components/SectionHomePage/BlogSectionNew';
import { SectionLoader } from '../../components/common/DivancoLoader';
import { HomeLoadingProvider, useHomeLoading } from '../../contexts/HomeLoadingContext';
import { useEffect } from 'react';

// Componente contenedor que utiliza el contexto
const HomePageContent = () => {
  const { loadingStates, setSectionLoaded } = useHomeLoading();
  
  console.log('HomePage - loadingStates:', loadingStates);
  
  // Temporizador de seguridad - desactiva todos los loaders después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('⏱️ Temporizador de seguridad activado - Forzando carga de todas las secciones');
      setSectionLoaded('projects', true);
      setSectionLoaded('blog', true);
      setSectionLoaded('showroom', true);
      setSectionLoaded('ediciones', true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [setSectionLoaded]);
  
  return (
    <div>
      <Hero />
      <SloganPage />
      
      <SectionLoader isLoading={loadingStates.projects} height="min-h-[400px]">
        <ProjectSection />
      </SectionLoader>
      
      <SectionLoader isLoading={loadingStates.blog} height="min-h-[350px]">
        <BlogSectionNew />
      </SectionLoader>
      
      <SectionLoader isLoading={loadingStates.showroom} height="min-h-[400px]">
        <ShowroomSection />
      </SectionLoader>
      
      <SectionLoader isLoading={loadingStates.ediciones} height="min-h-[350px]">
        <EdicionesPage />
      </SectionLoader>
      
      <section className="py-20 px-4 sm:px-6 lg:px-8"></section>
    </div>
  );
};

// Componente principal que proporciona el contexto
const HomePage = () => {
  return (
    <HomeLoadingProvider>
      <HomePageContent />
    </HomeLoadingProvider>
  );
};

export default HomePage;
