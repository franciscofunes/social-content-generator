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
  // Check if API key exists
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
    throw new Error('GEMINI_API_KEY environment variable is not set. Please add your Gemini API key to .env.local');
  }

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

// Enhanced prompt generation for social media content
export async function generateOptimizedSocialPrompt(
  userInput: string,
  options: {
    contentType?: string;
    tone?: string;
    targetAudience?: string;
    platforms?: string[];
    detectedLanguage?: string;
    languageOverride?: string;
    customInstructions?: string;
  } = {}
): Promise<string> {
  const {
    contentType = 'promotional',
    tone = 'professional',
    targetAudience = 'general business audience',
    platforms = ['instagram', 'linkedin'],
    detectedLanguage = 'en',
    languageOverride,
    customInstructions = ''
  } = options;

  const targetLanguage = languageOverride || detectedLanguage;
  const platformList = platforms.join(', ');

  const promptGenerationPrompt = `You are an expert social media strategist and content creator. Your task is to transform a basic user input into a detailed, compelling prompt that will generate high-quality social media content.

USER INPUT: "${userInput}"

CONTENT REQUIREMENTS:
- Target Language: ${targetLanguage}
- Content Type: ${contentType}
- Tone: ${tone}
- Target Audience: ${targetAudience}
- Platforms: ${platformList}
- Custom Instructions: ${customInstructions || 'None'}

TRANSFORMATION GUIDELINES:
1. EXPAND THE CONCEPT: Take the user's basic idea and expand it into a rich, detailed narrative
2. ADD CONTEXT: Include relevant industry context, trends, or timely information
3. SPECIFY BENEFITS: Clearly outline what value this provides to the audience
4. INCLUDE EMOTION: Add emotional hooks that will resonate with the target audience
5. ADD SPECIFICITY: Replace vague terms with specific, concrete examples
6. CULTURAL RELEVANCE: Ensure the content is culturally appropriate for ${targetLanguage} speakers

PROMPT STRUCTURE:
Create a detailed prompt that includes:
- A compelling hook/opening concept
- Specific details and examples
- Clear value proposition
- Emotional connection points
- Call-to-action suggestions
- Relevant context for the target audience

EXAMPLE TRANSFORMATION:
User Input: "New product launch"
Transformed Prompt: "Announce the launch of our innovative [specific product] that solves [specific problem] for [target audience]. Highlight the 3-month development journey, key features that set it apart from competitors, early customer testimonials showing [specific results], and limited-time launch pricing. Create excitement about how this product will transform [specific aspect] of users' lives, include behind-the-scenes insights from our team, and encourage early adoption with exclusive launch benefits."

Generate ONLY the optimized prompt in ${targetLanguage}, no explanations or additional text:`;

  try {
    const data = await makeGeminiRequest(promptGenerationPrompt);
    const optimizedPrompt = data.candidates[0].content.parts[0].text.trim();
    
    return optimizedPrompt;
  } catch (error) {
    console.error('Error generating optimized prompt:', error);
    
    // Enhanced fallback prompt generation
    return generateFallbackPrompt(userInput, targetLanguage, contentType, tone, platforms);
  }
}

// Fallback prompt generator when Gemini API is unavailable
function generateFallbackPrompt(
  userInput: string,
  language: string,
  contentType: string,
  tone: string,
  platforms: string[]
): string {
  const languagePrompts = {
    en: {
      promotional: `Promote ${userInput} with compelling benefits and unique value proposition. Include specific features, customer testimonials, and limited-time offers. Create urgency while maintaining authenticity. Highlight what sets this apart from competitors and why the audience should act now.`,
      educational: `Create educational content about ${userInput} that provides genuine value to your audience. Include practical tips, step-by-step guidance, common mistakes to avoid, and actionable insights. Share expert knowledge that helps people understand and apply these concepts effectively.`,
      inspirational: `Share an inspiring story or message about ${userInput} that motivates and uplifts your audience. Include personal experiences, overcoming challenges, lessons learned, and positive outcomes. Connect emotionally while providing hope and encouragement.`,
      'behind-scenes': `Give your audience an exclusive behind-the-scenes look at ${userInput}. Share the process, team insights, challenges faced, creative decisions, and authentic moments. Make it personal and relatable while showcasing your human side.`,
      'user-generated': `Showcase customer experiences and stories related to ${userInput}. Feature real testimonials, success stories, creative uses, and community highlights. Celebrate your audience and build social proof through authentic user content.`,
      trending: `Connect ${userInput} to current trends and relevant cultural moments. Reference timely events, popular discussions, and trending topics while maintaining relevance to your brand. Create content that feels current and conversation-worthy.`
    },
    es: {
      promotional: `Promociona ${userInput} con beneficios convincentes y propuesta de valor única. Incluye características específicas, testimonios de clientes y ofertas por tiempo limitado. Crea urgencia manteniendo autenticidad. Destaca qué lo diferencia de la competencia y por qué la audiencia debe actuar ahora.`,
      educational: `Crea contenido educativo sobre ${userInput} que proporcione valor genuino a tu audiencia. Incluye consejos prácticos, guía paso a paso, errores comunes a evitar y perspectivas accionables. Comparte conocimiento experto que ayude a las personas a entender y aplicar estos conceptos efectivamente.`,
      inspirational: `Comparte una historia o mensaje inspirador sobre ${userInput} que motive y eleve a tu audiencia. Incluye experiencias personales, superación de desafíos, lecciones aprendidas y resultados positivos. Conecta emocionalmente mientras proporcionas esperanza y aliento.`,
      'behind-scenes': `Dale a tu audiencia una mirada exclusiva detrás de escenas de ${userInput}. Comparte el proceso, perspectivas del equipo, desafíos enfrentados, decisiones creativas y momentos auténticos. Hazlo personal y relatable mientras muestras tu lado humano.`,
      'user-generated': `Muestra experiencias e historias de clientes relacionadas con ${userInput}. Presenta testimonios reales, historias de éxito, usos creativos y destacados de la comunidad. Celebra a tu audiencia y construye prueba social a través de contenido auténtico de usuarios.`,
      trending: `Conecta ${userInput} con tendencias actuales y momentos culturales relevantes. Referencia eventos oportunos, discusiones populares y temas en tendencia mientras mantienes relevancia con tu marca. Crea contenido que se sienta actual y digno de conversación.`
    }
  };

  const templates = languagePrompts[language as keyof typeof languagePrompts] || languagePrompts.en;
  const template = templates[contentType as keyof typeof templates] || templates.promotional;
  
  return template;
}

// Enhanced social content generation with multi-language support
export async function generateSocialContent(
  topic: string, 
  platforms: string[], 
  options: {
    contentType?: string;
    tone?: string;
    customInstructions?: string;
    detectedLanguage?: string;
    languageOverride?: string;
    imageUrl?: string;
  } = {}
): Promise<{ [platform: string]: { text: string; hashtags: string[] } }> {
  
  const {
    contentType = 'promotional',
    tone = 'professional',
    customInstructions = '',
    detectedLanguage = 'en',
    languageOverride,
    imageUrl
  } = options;

  const targetLanguage = languageOverride || detectedLanguage;
  
  // Enhanced system prompt with multi-language support
  const createPlatformPrompt = (platform: string) => {
    const platformSpecs = {
      instagram: {
        maxLength: '150-200 words',
        characteristics: 'Visual storytelling, lifestyle focus, aesthetic hashtags, engaging and authentic',
        maxHashtags: '8-12',
        features: 'Stories, Reels, Posts, IGTV'
      },
      linkedin: {
        maxLength: '300-500 words', 
        characteristics: 'Professional tone, industry insights, thought leadership angle, business networking',
        maxHashtags: '5-8',
        features: 'Professional updates, Articles, Events, Networking'
      },
      twitter: {
        maxLength: '250-280 characters',
        characteristics: 'Concise and punchy, trending topics, real-time engagement, viral potential',
        maxHashtags: '2-5',
        features: 'Tweets, Threads, Spaces, Moments'
      },
      facebook: {
        maxLength: '400-600 words',
        characteristics: 'Community engagement, storytelling approach, personal connection, longer form content',
        maxHashtags: '5-10',
        features: 'Posts, Stories, Events, Pages, Groups'
      },
      tiktok: {
        maxLength: '100-150 words',
        characteristics: 'Trend-aware, youthful tone, viral potential, creative and entertaining',
        maxHashtags: '3-8',
        features: 'Short videos, Trending sounds, Effects, Challenges'
      }
    };

    const spec = platformSpecs[platform as keyof typeof platformSpecs];
    if (!spec) return '';

    return `You are an expert social media content creator. Generate engaging, platform-optimized posts based on the user's input.

LANGUAGE REQUIREMENTS:
- Target language: ${targetLanguage}
- Maintain cultural relevance and appropriate tone for ${targetLanguage} speakers
- Use native expressions and cultural references when appropriate
- Ensure content feels natural and authentic in the target language

CONTENT REQUIREMENTS:
- Length: ${spec.maxLength}
- Platform: ${platform.toUpperCase()}
- Content Type: ${contentType}
- Tone: ${tone}
- Topic: "${topic}"
${customInstructions ? `- Custom Instructions: ${customInstructions}` : ''}

PLATFORM SPECIFICATIONS FOR ${platform.toUpperCase()}:
- Characteristics: ${spec.characteristics}
- Key Features: ${spec.features}
- Hashtag limit: ${spec.maxHashtags} relevant hashtags
- Optimize for ${platform}'s unique audience and algorithm

${imageUrl ? `VISUAL CONTENT: The post will include an image/visual: ${imageUrl}` : ''}

CONTENT STRUCTURE:
1. Engaging hook/opening
2. Main content with valuable insights
3. Call-to-action appropriate for the platform
4. Relevant hashtags optimized for discoverability

Generate comprehensive, longer content that maximizes the platform's potential while staying within limits.

Return ONLY valid JSON in this exact format:
{
  "text": "Complete post content here...",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
}`;
  };

  const results: { [platform: string]: { text: string; hashtags: string[] } } = {};

  // Generate content for each platform
  for (const platform of platforms) {
    try {
      const prompt = createPlatformPrompt(platform);
      const data = await makeGeminiRequest(prompt);
      const content = data.candidates[0].content.parts[0].text;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`No JSON found in ${platform} content response`);
      }
      
      results[platform] = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error(`Error generating ${platform} content:`, error);
      
      // Check if it's an API key error and provide helpful message
      if (error instanceof Error && error.message.includes('GEMINI_API_KEY')) {
        console.warn('⚠️ Gemini API key not configured. Using fallback content generation.');
        console.warn('💡 To use AI generation, add GEMINI_API_KEY to your .env.local file');
      }
      
      // Enhanced fallback content with multi-language support
      results[platform] = generateFallbackContent(platform, topic, targetLanguage, contentType, tone);
    }
  }

  return results;
}

// Enhanced fallback content generator
function generateFallbackContent(
  platform: string, 
  topic: string, 
  language: string, 
  contentType: string, 
  tone: string
): { text: string; hashtags: string[] } {
  
  const languageTemplates = {
    en: {
      templates: {
        promotional: {
          instagram: `🚀 Exciting news about ${topic}! 

This is a game-changer for our community and represents exactly what we've been working towards.

💡 Key highlights:
• Innovation at its finest
• Community-driven approach  
• Real impact and results
• Sustainable growth focus

Join us on this incredible journey and be part of something bigger. What are your thoughts? Let us know in the comments! 👇`,
          linkedin: `Professional Insight: ${topic}

In today's rapidly evolving business landscape, understanding and leveraging ${topic} has become increasingly critical for organizational success.

KEY STRATEGIC CONSIDERATIONS:
• Market positioning and competitive advantage
• Implementation roadmap and timeline
• Resource allocation and team development
• ROI measurement and performance metrics
• Risk mitigation and contingency planning

INDUSTRY IMPACT:
The integration of ${topic} into business operations is transforming how companies approach their core strategies, enabling them to achieve unprecedented levels of efficiency and innovation.

What has been your experience with ${topic} in your organization? I'd love to hear your insights and lessons learned.`,
          twitter: `🚀 ${topic} is transforming the industry! Here's what every business leader needs to know about this game-changing development. The future is happening now! 👇`,
          facebook: `We're excited to share insights about ${topic} with our community! 

This topic has been gaining significant attention, and for good reason. ${topic} represents a shift in how we approach business challenges and opportunities.

Here's what makes it special:
✨ Innovative approaches to traditional problems
🎯 Clear value proposition for businesses
🚀 Scalable solutions for growth
💪 Community-driven development

We'd love to hear your thoughts and experiences. How has ${topic} impacted your work or business? Share your story in the comments!`,
          tiktok: `POV: You just discovered ${topic} and it's about to change everything! 🤯 Here's the tea on why everyone's talking about this trend. Who else is ready to level up? ✨ #Trending #GameChanger`
        },
        educational: {
          instagram: `📚 Learning opportunity: ${topic}

Understanding ${topic} can make a significant difference in how we approach our daily challenges.

🎯 Essential takeaways:
• Knowledge is power when applied correctly
• Continuous learning drives success
• Practical application matters most
• Share knowledge to multiply impact

Education never stops, and neither should our curiosity. What's one thing you learned recently that changed your perspective?`,
          linkedin: `Educational Deep Dive: Understanding ${topic}

As professionals, our commitment to continuous learning and development is what sets us apart in today's competitive landscape.

LEARNING FRAMEWORK:
• Theoretical foundation and core principles
• Practical applications and real-world examples
• Best practices from industry leaders
• Common challenges and how to overcome them
• Future trends and emerging opportunities

PROFESSIONAL DEVELOPMENT:
Investing time in understanding ${topic} not only enhances our current capabilities but also prepares us for future opportunities and challenges in our respective fields.

How do you approach continuous learning in your professional journey?`,
          twitter: `📚 Quick lesson on ${topic}: Knowledge is power when you know how to apply it. Here are 3 key insights that changed my perspective. Thread 🧵 1/3`,
          facebook: `Educational Post: Deep Dive into ${topic}

Hey everyone! I wanted to share some valuable insights about ${topic} that I've been learning about recently.

Why does this matter?
${topic} is becoming increasingly important in our personal and professional lives. Understanding its fundamentals can help us make better decisions and stay ahead of the curve.

Key Learning Points:
📖 Core concepts and principles
🔧 Practical applications
💡 Real-world examples
🎯 How to implement effectively

I believe that sharing knowledge strengthens our entire community. What resources have you found helpful for learning about ${topic}? Drop them in the comments!`,
          tiktok: `Learning ${topic} in 60 seconds! 📚✨ Save this for later because these tips are pure gold. Who else is ready to become an expert? #LearnOnTikTok #EducationTok`
        }
      },
      hashtags: {
        business: ['#Business', '#Innovation', '#Strategy', '#Growth', '#Success'],
        tech: ['#Technology', '#Digital', '#Innovation', '#Future', '#TechTrends'],
        education: ['#Education', '#Learning', '#Knowledge', '#Growth', '#Development']
      }
    },
    es: {
      templates: {
        promotional: {
          instagram: `🚀 ¡Noticias emocionantes sobre ${topic}!

Esto representa un cambio revolucionario para nuestra comunidad y exactamente lo que hemos estado construyendo.

💡 Puntos destacados:
• Innovación en su máxima expresión
• Enfoque centrado en la comunidad
• Impacto real y resultados tangibles
• Crecimiento sostenible y responsable

Únete a nosotros en este increíble viaje y sé parte de algo más grande. ¿Qué opinas? ¡Compártenos tu perspectiva! 👇`,
          linkedin: `Perspectiva Profesional: ${topic}

En el panorama empresarial actual, comprender y aprovechar ${topic} se ha vuelto fundamental para el éxito organizacional.

CONSIDERACIONES ESTRATÉGICAS CLAVE:
• Posicionamiento en el mercado y ventaja competitiva
• Hoja de ruta de implementación y cronograma
• Asignación de recursos y desarrollo de equipos
• Medición de ROI y métricas de rendimiento
• Mitigación de riesgos y planes de contingencia

IMPACTO EN LA INDUSTRIA:
La integración de ${topic} en las operaciones empresariales está transformando cómo las empresas abordan sus estrategias centrales.

¿Cuál ha sido tu experiencia con ${topic} en tu organización?`,
          twitter: `🚀 ${topic} está transformando la industria! Aquí tienes lo que todo líder empresarial necesita saber sobre este desarrollo revolucionario. ¡El futuro es ahora! 👇`,
          facebook: `¡Estamos emocionados de compartir información sobre ${topic} con nuestra comunidad!

Este tema ha estado ganando atención significativa, y por buenas razones. ${topic} representa un cambio en cómo abordamos los desafíos y oportunidades empresariales.

Esto es lo que lo hace especial:
✨ Enfoques innovadores a problemas tradicionales
🎯 Propuesta de valor clara para empresas
🚀 Soluciones escalables para el crecimiento
💪 Desarrollo impulsado por la comunidad

Nos encantaría escuchar tus pensamientos y experiencias. ¿Cómo ha impactado ${topic} tu trabajo o negocio? ¡Comparte tu historia en los comentarios!`,
          tiktok: `POV: Acabas de descubrir ${topic} y está a punto de cambiar todo! 🤯 Aquí está la verdad sobre por qué todos hablan de esta tendencia. ¿Quién más está listo para subir de nivel? ✨`
        },
        educational: {
          instagram: `📚 Oportunidad de aprendizaje: ${topic}

Entender ${topic} puede hacer una diferencia significativa en cómo abordamos nuestros desafíos diarios.

🎯 Puntos clave:
• El conocimiento es poder cuando se aplica correctamente
• El aprendizaje continuo impulsa el éxito
• La aplicación práctica es lo más importante
• Compartir conocimiento multiplica el impacto

La educación nunca se detiene, y nuestra curiosidad tampoco debería. ¿Qué es algo que aprendiste recientemente que cambió tu perspectiva?`,
          linkedin: `Análisis Educativo: Entendiendo ${topic}

Como profesionales, nuestro compromiso con el aprendizaje continuo y el desarrollo es lo que nos distingue en el panorama competitivo actual.

MARCO DE APRENDIZAJE:
• Base teórica y principios fundamentales
• Aplicaciones prácticas y ejemplos del mundo real
• Mejores prácticas de líderes de la industria
• Desafíos comunes y cómo superarlos
• Tendencias futuras y oportunidades emergentes

DESARROLLO PROFESIONAL:
Invertir tiempo en entender ${topic} no solo mejora nuestras capacidades actuales, sino que también nos prepara para futuras oportunidades y desafíos en nuestros campos respectivos.

¿Cómo abordas el aprendizaje continuo en tu carrera profesional?`,
          twitter: `📚 Lección rápida sobre ${topic}: El conocimiento es poder cuando sabes cómo aplicarlo. Aquí tienes 3 ideas clave que cambiaron mi perspectiva. Hilo 🧵 1/3`,
          facebook: `Post Educativo: Análisis Profundo de ${topic}

¡Hola a todos! Quería compartir algunas ideas valiosas sobre ${topic} que he estado aprendiendo recientemente.

¿Por qué es importante esto?
${topic} se está volviendo cada vez más importante en nuestras vidas personales y profesionales. Entender sus fundamentos puede ayudarnos a tomar mejores decisiones y mantenernos a la vanguardia.

Puntos Clave de Aprendizaje:
📖 Conceptos y principios fundamentales
🔧 Aplicaciones prácticas
💡 Ejemplos del mundo real
🎯 Cómo implementar efectivamente

Creo que compartir conocimiento fortalece toda nuestra comunidad. ¿Qué recursos has encontrado útiles para aprender sobre ${topic}? ¡Compártelos en los comentarios!`,
          tiktok: `¡Aprendiendo ${topic} en 60 segundos! 📚✨ Guarda esto para después porque estos consejos son oro puro. ¿Quién más está listo para convertirse en experto?`
        }
      },
      hashtags: {
        business: ['#Negocios', '#Innovación', '#Estrategia', '#Crecimiento', '#Éxito'],
        tech: ['#Tecnología', '#Digital', '#Innovación', '#Futuro', '#TendenciasTech'],
        education: ['#Educación', '#Aprendizaje', '#Conocimiento', '#Crecimiento', '#Desarrollo']
      }
    }
  };

  const templates = languageTemplates[language as keyof typeof languageTemplates] || languageTemplates.en;
  const platformTemplate = templates.templates[contentType as keyof typeof templates.templates]?.[platform as keyof any];
  
  if (!platformTemplate) {
    // Basic fallback if no template exists
    return {
      text: `${topic}\n\nQuality content about ${topic} for ${platform}.\n\n#${topic.replace(/\s+/g, '')} #Content #${platform}`,
      hashtags: [`#${topic.replace(/\s+/g, '')}`, '#Content', `#${platform}`]
    };
  }

  // Get appropriate hashtags
  let categoryHashtags = templates.hashtags.business;
  if (topic.toLowerCase().includes('tech') || topic.toLowerCase().includes('digital')) {
    categoryHashtags = templates.hashtags.tech;
  } else if (topic.toLowerCase().includes('learn') || topic.toLowerCase().includes('education')) {
    categoryHashtags = templates.hashtags.education;
  }

  return {
    text: platformTemplate,
    hashtags: [...categoryHashtags, `#${topic.replace(/\s+/g, '')}`]
  };
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


