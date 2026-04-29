// Funciones simples de scroll para las flechas
export const scrollToSection = (sectionId) => {
  const element = document.querySelector(sectionId);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

export const scrollToNextSection = () => {
  window.scrollTo({
    top: window.scrollY + window.innerHeight,
    behavior: 'smooth'
  });
};
