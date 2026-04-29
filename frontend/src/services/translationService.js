class TranslationService {
  constructor() {
    this.cache = new Map();
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  }

  // Crear clave de cache
  getCacheKey(text, targetLang, sourceContent = '') {
    return `${text}-${targetLang}-${sourceContent}`.substring(0, 100);
  }

  // Traducir con OpenAI
  async translateWithOpenAI(text, targetLang, context = '') {
    const cacheKey = this.getCacheKey(text, targetLang, context);
    
    // Verificar cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the following text to ${targetLang === 'en' ? 'English' : 'Spanish'}. Maintain the original tone and context. ${context ? `Context: ${context}` : ''}`
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        })
      });

      const data = await response.json();
      const translation = data.choices[0]?.message?.content || text;
      
      // Guardar en cache
      this.cache.set(cacheKey, translation);
      
      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback al texto original
    }
  }

  // Traducir contenido dinámico
  async translateDynamicContent(content, targetLang, contentType = 'general') {
    if (!content || targetLang === 'es') return content;
    
    return await this.translateWithOpenAI(content, targetLang, contentType);
  }
}

export const translationService = new TranslationService();
