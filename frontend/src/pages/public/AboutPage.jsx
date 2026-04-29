import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from '../../hooks';
import { 
  FaLightbulb, 
  FaHeart, 
  FaStar, 
  FaUsers, 
  FaGlobeAmericas, 
  FaHandshake 
} from 'react-icons/fa';

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('aboutPage.title')}</title>
        <meta name="description" content={t('aboutPage.metaDescription')} />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}></div>
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-12">
              <span className="text-xs font-medium text-gray-500 tracking-wider uppercase">
                — {t('aboutPage.sectionTitle')}
              </span>
            </div>

            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light text-gray-900 leading-tight">
                {t('aboutPage.heroTitle')}{' '}
                <span className="italic text-naranjaDivanco">{t('aboutPage.heroTitleHighlight')}</span>
                <br />
                {t('aboutPage.heroTitleEnd')}
              </h1>

              <div className="max-w-3xl mx-auto">
                <p className="text-lg lg:text-xl text-gray-600 leading-relaxed font-light">
                  {t('aboutPage.heroDescription')}
                </p>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="w-px h-12 bg-gray-300 mx-auto mb-2"></div>
            <svg className="w-4 h-4 text-gray-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

        {/* Misión y Visión */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Misión */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-naranjaDivanco rounded-full flex items-center justify-center">
                    <FaStar className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-light text-gray-900">
                    {t('aboutPage.mission.title')}
                  </h2>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t('aboutPage.mission.description')}
                </p>
              </div>

              {/* Visión */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-naranjaDivanco rounded-full flex items-center justify-center">
                    <FaGlobeAmericas className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-light text-gray-900">
                    {t('aboutPage.vision.title')}
                  </h2>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t('aboutPage.vision.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Propósito */}
        <section className="py-24 lg:py-32 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-naranjaDivanco rounded-full flex items-center justify-center">
                  <FaHeart className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-4xl lg:text-5xl font-light text-gray-900">
                {t('aboutPage.purpose.title')}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
                {t('aboutPage.purpose.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Propuesta de Valor - Hero */}
        <section className="py-24 lg:py-32 bg-gradient-to-br from-naranjaDivanco to-orange-700 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-light">
                  {t('aboutPage.valueProposition.title')}
                </h2>
                <p className="text-xl text-orange-100 italic">
                  {t('aboutPage.valueProposition.subtitle')}
                </p>
              </div>
              <div className="h-px bg-orange-300 w-24 mx-auto"></div>
              <p className="text-lg leading-relaxed text-orange-50 max-w-4xl mx-auto">
                {t('aboutPage.valueProposition.mainStatement')}
              </p>
            </div>
          </div>
        </section>

        {/* Naturaleza del Servicio */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6">
                {t('aboutPage.valueProposition.nature.title')}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto">
                {t('aboutPage.valueProposition.nature.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
              {/* Pilar 1 */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                  <FaLightbulb className="w-8 h-8 text-naranjaDivanco" />
                </div>
                <h3 className="text-xl font-medium text-gray-900">
                  {t('aboutPage.valueProposition.nature.pillars.design.title')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('aboutPage.valueProposition.nature.pillars.design.description')}
                </p>
              </div>

              {/* Pilar 2 */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                  <FaStar className="w-8 h-8 text-naranjaDivanco" />
                </div>
                <h3 className="text-xl font-medium text-gray-900">
                  {t('aboutPage.valueProposition.nature.pillars.construction.title')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('aboutPage.valueProposition.nature.pillars.construction.description')}
                </p>
              </div>

              {/* Pilar 3 */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                  <FaHandshake className="w-8 h-8 text-naranjaDivanco" />
                </div>
                <h3 className="text-xl font-medium text-gray-900">
                  {t('aboutPage.valueProposition.nature.pillars.hardware.title')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('aboutPage.valueProposition.nature.pillars.hardware.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Diferenciales */}
        <section className="py-24 lg:py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900">
                {t('aboutPage.valueProposition.differentiators.title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {t(`aboutPage.valueProposition.differentiators.items.${index}.title`)}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t(`aboutPage.valueProposition.differentiators.items.${index}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Valores Funcional, Emocional y Social */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-20">
              {/* Valor Funcional */}
              <div>
                <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">
                  {t('aboutPage.valueProposition.functionalValue.title')}
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                  {[0, 1, 2, 3].map((index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-naranjaDivanco flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600">
                        {t(`aboutPage.valueProposition.functionalValue.items.${index}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Valor Emocional */}
              <div className="bg-orange-50 p-12 rounded-2xl">
                <div className="max-w-4xl mx-auto text-center">
                  <h2 className="text-3xl font-light text-gray-900 mb-6">
                    {t('aboutPage.valueProposition.emotionalValue.title')}
                  </h2>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {t('aboutPage.valueProposition.emotionalValue.description')}
                  </p>
                </div>
              </div>

              {/* Valor Social */}
              <div>
                <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">
                  {t('aboutPage.valueProposition.socialValue.title')}
                </h2>
                <ul className="space-y-6 max-w-4xl mx-auto">
                  {[0, 1, 2].map((index) => (
                    <li key={index} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-naranjaDivanco rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FaUsers className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-600 text-lg leading-relaxed">
                        {t(`aboutPage.valueProposition.socialValue.items.${index}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Posicionamiento Final */}
        <section className="py-24 lg:py-32 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <h2 className="text-3xl lg:text-4xl font-light">
                {t('aboutPage.valueProposition.positioning.title')}
              </h2>
              <div className="h-px bg-gray-600 w-24 mx-auto"></div>
              <p className="text-2xl lg:text-3xl font-light leading-relaxed text-gray-100 italic">
                "{t('aboutPage.valueProposition.positioning.statement')}"
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
