import { Topic } from '@/lib/types/topic';
import { getCurrentSeason } from '@/lib/utils/date';

const GEMINI_CONFIG = {
  // Use gemini-1.5-flash for free tier (faster and more generous quota)
  model: 'gemini-1.5-flash',
  maxTokens: 1000,
  temperature: 0.7,
};

// Generic API call with retry logic
async function makeGeminiRequest(prompt: string, maxRetries: number = 3): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CONFIG.model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: GEMINI_CONFIG.temperature,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle specific quota errors
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before making more requests.');
        }
        
        if (response.status === 403 && errorText.includes('quota')) {
          throw new Error('API quota exceeded. Please check your Gemini API usage.');
        }
        
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      // Check if response has the expected structure
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response structure from Gemini API');
      }
      
      return data;
      
    } catch (error) {
      console.warn(
        `Attempt ${attempt} failed:`,
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : String(error)
      );
      
      // Don't retry on quota/auth errors
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as any).message === 'string' &&
        ((error as any).message.includes('quota') || (error as any).message.includes('authentication'))
      ) {
        throw error;
      }
      
      // Exponential backoff for retries
      if (attempt < maxRetries) {
        const backoffTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`Retrying in ${backoffTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      } else {
        throw error;
      }
    }
  }
}

const TOPIC_DISCOVERY_PROMPT = `
Generate 25 specific workplace safety topics for Argentina, focusing on CABA and Buenos Aires province regulations. 

Categories to cover:
- normativas: Normativas y regulaciones laborales argentinas
- epp: Equipos de protección personal (EPP)
- prevencion: Prevención de accidentes laborales  
- ergonomia: Ergonomía y salud laboral
- primeros-auxilios: Primeros auxilios y emergencias
- construccion: Seguridad en construcción
- quimicos: Riesgos químicos y biológicos
- electrica: Seguridad eléctrica
- maquinaria: Manejo de maquinaria
- capacitacion: Capacitación y entrenamiento

For each topic, provide:
- title: Specific, actionable topic title in Spanish
- category: One of the categories above (use exact key names)
- description: Brief description of what content would cover
- priorityScore: 1-10 based on importance/urgency
- seasonalRelevance: "verano", "invierno", or "all"
- keywords: Array of relevant Spanish keywords

Focus on:
- Current Argentine labor laws and regulations
- CABA and Buenos Aires province specific requirements
- Practical workplace applications
- Recent regulatory changes
- Seasonal workplace hazards

Return ONLY a valid JSON array with exactly this structure:
[{
  "title": "string",
  "category": "normativas|epp|prevencion|ergonomia|primeros-auxilios|construccion|quimicos|electrica|maquinaria|capacitacion",
  "description": "string",
  "priorityScore": number,
  "seasonalRelevance": "verano|invierno|all",
  "keywords": ["string"]
}]
`;

const DAILY_TOPIC_SELECTION_PROMPT = (unusedTopics: Topic[], currentSeason: string) => `
From this list of unused workplace safety topics: 
${JSON.stringify(unusedTopics.slice(0, 20), null, 2)}

Select 3 diverse topics for today's content generation. Consider:
- Current season: ${currentSeason}
- Recent safety incidents or news
- Category balance (don't select 3 topics from same category)
- Priority scores (prefer higher priority topics)
- Seasonal relevance

Return ONLY the selected topic IDs as a JSON array: ["id1", "id2", "id3"]
`;

const INSTAGRAM_CONTENT_PROMPT = (topic: Topic) => `
Create engaging Instagram post content in Spanish for Argentine workplace safety topic: "${topic.title}"

Requirements:
- 150-200 words maximum
- Professional but engaging tone
- Include specific Argentine workplace safety regulations
- Focus on CABA and Buenos Aires province context
- Add practical, actionable advice
- Include relevant emojis sparingly (max 3)
- End with call-to-action

Topic details: ${topic.description}
Category: ${topic.category}

Generate ONLY valid JSON: { "text": "...", "hashtags": ["#SeguridadLaboral", "#Argentina", "#CABA"] }
`;

const LINKEDIN_CONTENT_PROMPT = (topic: Topic) => `
Create professional LinkedIn post content in Spanish for Argentine workplace safety topic: "${topic.title}"

Requirements:
- 300-400 words
- Professional, educational tone
- Include specific Argentine labor law references
- Focus on CABA and Buenos Aires province regulations
- Provide detailed, actionable insights
- Professional formatting with line breaks

Topic details: ${topic.description}
Category: ${topic.category}

Generate ONLY valid JSON: { "text": "...", "hashtags": ["#SeguridadLaboral", "#Argentina", "#RRHH"] }
`;

export async function generateTopics(): Promise<Topic[]> {
  try {
    console.log('Generating topics with Gemini Free Tier...');
    const data = await makeGeminiRequest(TOPIC_DISCOVERY_PROMPT);
    const content = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in Gemini response');
    }
    
    const topics = JSON.parse(jsonMatch[0]);
    
    return topics.map((topic: any, index: number) => ({
      id: `topic_${Date.now()}_${index}`,
      title: topic.title,
      category: topic.category,
      description: topic.description,
      priorityScore: topic.priorityScore,
      seasonalRelevance: topic.seasonalRelevance,
      keywords: topic.keywords,
      usageCount: 0,
      createdDate: new Date(),
      isArchived: false
    }));
    
  } catch (error) {
    console.error('Error generating topics:', error);
    throw new Error(`Failed to generate topics: ${typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error)}`);
  }
}

export async function selectDailyTopics(unusedTopics: Topic[]): Promise<string[]> {
  // BYPASS GEMINI API - USE FALLBACK TOPIC SELECTION FOR TESTING
  console.log('Selecting daily topics (HARDCODED FALLBACK FOR TESTING)...');
  const shuffled = [...unusedTopics].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3).map(topic => topic.id);
  
  /* ORIGINAL GEMINI API CODE - COMMENTED OUT FOR TESTING
  try {
    console.log('Selecting daily topics...');
    const currentSeason = getCurrentSeason();
    const data = await makeGeminiRequest(DAILY_TOPIC_SELECTION_PROMPT(unusedTopics, currentSeason));
    const content = data.candidates[0].content.parts[0].text;
    
    const jsonMatch = content.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in topic selection response');
    }
    
    return JSON.parse(jsonMatch[0]);
    
  } catch (error) {
    console.error('Error selecting daily topics:', error);
    
    // Fallback: select topics locally if API fails
    console.log('Using fallback topic selection...');
    const shuffled = [...unusedTopics].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map(topic => topic.id);
  }
  */
}

// NEW CHAT-BASED API FUNCTIONS

export async function generateOptimizedPrompt(description: string): Promise<string> {
  const prompt = `You are an expert prompt engineer specializing in BRIA AI image generation. Transform this user description into a highly detailed, professional prompt optimized for BRIA HD model 2.2: "${description}"

BRIA HD OPTIMIZATION GUIDELINES:
- BRIA excels with highly detailed, technical photography descriptions
- Include specific lighting terms (professional studio lighting, natural window light, optimal exposure)
- Add composition details (sharp focus, depth of field, professional framing)
- Specify image quality (high resolution, commercial grade, professional photography)
- Include texture and detail descriptions (detailed textures, sharp details, realistic rendering)
- Add professional context (corporate setting, business environment, workplace appropriate)
- Mention camera/technical aspects when relevant (professional photography, commercial quality)

STRUCTURE YOUR ENHANCED PROMPT:
1. Start with image type/style (e.g., "Professional corporate photography of...")
2. Add detailed subject description
3. Include specific lighting details
4. Add composition and technical quality terms
5. End with professional quality descriptors

EXAMPLES OF GOOD BRIA PROMPTS:
- "Professional corporate photography of modern office workspace, sharp focus, professional lighting, detailed textures, high resolution, commercial quality"
- "Industrial safety photograph showing workers in protective equipment, clear documentation style, professional lighting, detailed workplace environment, realistic rendering"

Keep the enhanced prompt under 200 words but make it significantly more detailed than the original.

Return ONLY the optimized prompt, no explanations or additional text.`;

  try {
    const data = await makeGeminiRequest(prompt);
    const optimizedPrompt = data.candidates[0].content.parts[0].text.trim();
    
    // Additional enhancement with our local BRIA optimization
    const localEnhancement = enhanceBasicPrompt(optimizedPrompt);
    
    return localEnhancement;
  } catch (error) {
    console.error('Error generating optimized prompt:', error);
    
    // Fallback: use our local enhancement function
    console.log('Using local prompt enhancement fallback...');
    return enhanceBasicPrompt(description);
  }
}

// Local prompt enhancement function as fallback
function enhanceBasicPrompt(userPrompt: string): string {
  const cleanPrompt = userPrompt.trim();
  
  // Detect content type for appropriate enhancement
  let enhancementStyle = 'corporate photography';
  if (cleanPrompt.toLowerCase().includes('safety') || cleanPrompt.toLowerCase().includes('equipment')) {
    enhancementStyle = 'industrial documentation photography';
  } else if (cleanPrompt.toLowerCase().includes('person') || cleanPrompt.toLowerCase().includes('worker')) {
    enhancementStyle = 'professional portrait photography';
  } else if (cleanPrompt.toLowerCase().includes('office') || cleanPrompt.toLowerCase().includes('workspace')) {
    enhancementStyle = 'corporate interior photography';
  }
  
  // Build enhanced prompt with BRIA-specific terminology
  let enhanced = `Professional ${enhancementStyle} of ${cleanPrompt}`;
  enhanced += ', shot with professional equipment, optimal lighting conditions, sharp focus throughout';
  enhanced += ', high resolution detail, commercial photography quality, professional composition';
  enhanced += ', realistic textures and materials, excellent color accuracy, suitable for business use';
  enhanced += ', clean professional aesthetic, commercial grade output, photorealistic rendering';
  
  return enhanced;
}

export async function generateSocialContent(topic: string, platform: 'instagram' | 'linkedin', imageUrl?: string): Promise<{ text: string; hashtags: string[] }> {
  const platformPrompt = platform === 'instagram' 
    ? `Create engaging Instagram post content in Spanish for this topic: "${topic}"

Requirements:
- 150-200 words maximum
- Professional but engaging tone
- Include 2-3 relevant emojis
- Focus on Argentine workplace context
- End with call-to-action
- Generate 5-8 relevant hashtags

${imageUrl ? `The post will include an image: ${imageUrl}` : ''}

Return ONLY valid JSON: { "text": "...", "hashtags": ["#hashtag1", "#hashtag2"] }`
    : `Create professional LinkedIn post content in Spanish for this topic: "${topic}"

Requirements:
- 300-400 words
- Professional, educational tone
- Focus on Argentine business context
- Provide actionable insights
- Professional formatting with line breaks
- Generate 5-8 professional hashtags

${imageUrl ? `The post will include an image: ${imageUrl}` : ''}

Return ONLY valid JSON: { "text": "...", "hashtags": ["#hashtag1", "#hashtag2"] }`;

  try {
    const data = await makeGeminiRequest(platformPrompt);
    const content = data.candidates[0].content.parts[0].text;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in social content response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error(`Error generating ${platform} content:`, error);
    
    // Fallback content
    const fallbackContent = {
      instagram: {
        text: `📱 ${topic}

Contenido profesional para redes sociales enfocado en el ámbito laboral argentino.

💡 Puntos clave:
• Información relevante y actualizada
• Enfoque en normativas argentinas
• Contenido de calidad profesional

Ideal para empresas que buscan comunicar temas laborales de manera efectiva en redes sociales.

¿Qué opinas sobre este tema? ¡Comparte tu experiencia! 👇

#ContenidoLaboral #Argentina #RedesSociales #Empresa #Trabajo`,
        hashtags: ["#ContenidoLaboral", "#Argentina", "#RedesSociales", "#Empresa", "#Trabajo"]
      },
      linkedin: {
        text: `${topic}

En el contexto empresarial argentino, es fundamental mantenerse actualizado sobre los temas laborales más relevantes.

ASPECTOS DESTACADOS:
• Cumplimiento normativo según legislación argentina
• Mejores prácticas del sector
• Impacto en la productividad empresarial
• Beneficios para empleados y empleadores

REFLEXIÓN:
La comunicación efectiva de contenido laboral en plataformas profesionales como LinkedIn permite a las empresas posicionarse como referentes en su sector, compartir conocimiento valioso y generar engagement con su audiencia objetivo.

¿Cómo aborda tu empresa la comunicación de temas laborales en redes sociales?

#LinkedIn #ContenidoEmpresarial #Argentina #RecursosHumanos #ComunicaciónCorporativa`,
        hashtags: ["#LinkedIn", "#ContenidoEmpresarial", "#Argentina", "#RecursosHumanos", "#ComunicaciónCorporativa"]
      }
    };
    
    return fallbackContent[platform];
  }
}

// LEGACY FUNCTIONS (KEPT FOR COMPATIBILITY)

export async function generateContent(topic: Topic, platform: 'instagram' | 'linkedin'): Promise<{ text: string; hashtags: string[] }> {
  // TEMPORARILY BYPASS GEMINI API - HARDCODED CONTENT FOR TESTING BRIA AI
  console.log(`Generating ${platform} content for topic: ${topic.title} (HARDCODED FOR TESTING)`);
  
  const hardcodedContent = {
    instagram: {
      text: `🚨 SEGURIDAD LABORAL EN ARGENTINA 🚨

${topic.title}

En el ámbito laboral argentino, la seguridad es prioritaria. ${topic.description}

💡 Consejos importantes:
• Usar siempre equipos de protección personal
• Seguir protocolos establecidos
• Reportar situaciones de riesgo
• Capacitarse constantemente

En CABA y Buenos Aires, cumplir con las normativas es fundamental para proteger a todos los trabajadores.

#SeguridadLaboral #Argentina #CABA #TrabajoSeguro`,
      hashtags: ["#SeguridadLaboral", "#Argentina", "#CABA", "#TrabajoSeguro", "#EPP", "#PrevenciónLaboral"]
    },
    linkedin: {
      text: `Seguridad e Higiene Laboral en Argentina: ${topic.title}

La implementación de medidas de seguridad laboral en Argentina, especialmente en CABA y la provincia de Buenos Aires, es un tema de vital importancia para empresas y trabajadores.

${topic.description}

MARCO NORMATIVO:
Las empresas argentinas deben cumplir con la Ley 19.587 de Higiene y Seguridad en el Trabajo y sus decretos reglamentarios, especialmente el Decreto 351/79.

RESPONSABILIDADES EMPRESARIALES:
• Proveer equipos de protección personal adecuados
• Realizar capacitaciones periódicas obligatorias
• Mantener un ambiente de trabajo seguro
• Implementar protocolos de emergencia
• Cumplir con las inspecciones de la SRT

BENEFICIOS DE LA IMPLEMENTACIÓN:
La inversión en seguridad laboral no solo protege a los trabajadores, sino que también reduce costos por accidentes, mejora la productividad y fortalece la reputación empresarial.

¿Tu empresa cumple con todas las normativas de seguridad laboral vigentes en Argentina?

#SeguridadLaboral #Argentina #RRHH #GestiónEmpresarial #SRT #PrevenciónLaboral`,
      hashtags: ["#SeguridadLaboral", "#Argentina", "#RRHH", "#GestiónEmpresarial", "#SRT", "#PrevenciónLaboral"]
    }
  };

  return hardcodedContent[platform];
}


