const BRIA_CONFIG = {
  // Official BRIA API endpoint from documentation
  baseUrl: 'https://engine.prod.bria-api.com/v1',
  modelVersion: '2.2', // HD endpoint only supports 2.2
  imageSpecs: {
    instagram: { width: 1080, height: 1080 },
    linkedin: { width: 1200, height: 630 }
  },
  // Rate limiting based on plan (assuming Free Trial for safety)
  rateLimits: {
    requestsPerMinute: 10, // Free Trial limit
    requestsPerDay: 1000   // Conservative daily limit
  }
};

const IMAGE_GENERATION_PROMPTS = {
  normativas: "Professional Argentine office environment with safety regulations poster on wall, business professionals in corporate attire reviewing safety compliance documents, modern glass conference room, natural lighting, detailed workplace setting with visible safety signage",
  epp: "High-quality arrangement of personal protective equipment including yellow hard hat, safety glasses, reflective vest, work gloves, and steel-toe boots displayed on clean industrial workbench, professional product photography lighting, detailed textures",
  prevencion: "Professional safety instructor demonstrating proper lifting techniques to diverse group of workers in modern training facility, clear educational setting, professional presentation equipment, detailed facial expressions showing engagement",
  ergonomia: "Modern office worker demonstrating correct posture at ergonomic workstation, adjustable monitor at eye level, ergonomic chair with proper lumbar support, organized desk setup, natural window lighting, professional business environment",
  "primeros-auxilios": "Well-organized first aid station with clearly labeled emergency equipment, professional first aid kit contents displayed systematically, modern workplace emergency preparedness setup, clean medical supplies arrangement",
  construccion: "Construction workers wearing complete PPE including hard hats and safety vests working on modern building site, visible safety protocols in action, professional construction equipment, detailed industrial setting with safety barriers",
  quimicos: "Professional laboratory technician in full chemical safety gear handling hazardous materials in modern industrial facility, proper ventilation systems visible, safety equipment and protocols clearly demonstrated, detailed scientific setting",
  electrica: "Electrical safety professional demonstrating proper lockout-tagout procedures on industrial control panel, wearing appropriate PPE, modern electrical safety equipment, detailed technical workplace environment",
  maquinaria: "Industrial workers following safety protocols around modern manufacturing equipment, proper machine guarding visible, safety signage and emergency stops clearly marked, professional industrial photography",
  capacitacion: "Professional training session in modern conference room, diverse group of employees engaged in safety education, instructor using presentation materials, clean corporate training environment with professional lighting",
  general: "Professional workplace scene showcasing safety awareness, modern business environment, proper safety protocols being followed, clean and organized setting"
};

// Rate limiting state
let requestCount = 0;
let dailyRequestCount = 0;
let lastRequestTime = 0;
let dailyResetTime = Date.now() + (24 * 60 * 60 * 1000);

// Rate limiting helper
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  
  // Reset daily counter if needed
  if (now > dailyResetTime) {
    dailyRequestCount = 0;
    dailyResetTime = now + (24 * 60 * 60 * 1000);
  }
  
  // Check daily limit
  if (dailyRequestCount >= BRIA_CONFIG.rateLimits.requestsPerDay) {
    throw new Error('Daily BRIA API quota exceeded. Please try again tomorrow.');
  }
  
  // Check per-minute rate limit
  const timeSinceLastRequest = now - lastRequestTime;
  const minInterval = (60 * 1000) / BRIA_CONFIG.rateLimits.requestsPerMinute;
  
  if (timeSinceLastRequest < minInterval) {
    const waitTime = minInterval - timeSinceLastRequest;
    console.log(`Rate limiting: waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
  dailyRequestCount++;
}

// Make BRIA API request with proper authentication and error handling
async function makeBriaRequest(endpoint: string, payload: any, apiKey: string): Promise<Response> {
  await waitForRateLimit();
  
  console.log(`Making BRIA API request to: ${endpoint}`);
  console.log('Payload:', JSON.stringify(payload, null, 2));
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'api_token': apiKey,  // Official BRIA API authentication header
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  console.log(`BRIA API response: ${response.status} ${response.statusText}`);
  
  // Handle rate limiting
  if (response.status === 429) {
    const waitTime = 60000; // Wait 1 minute for rate limit reset
    console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    // Retry once after rate limit
    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'api_token': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }
  
  return response;
}

// Enhanced prompt conversion for BRIA HD model
function enhancePromptForBria(userPrompt: string, platform: 'instagram' | 'linkedin' = 'instagram'): {
  prompt: string;
  negative_prompt: string;
} {
  // Clean and normalize the user prompt
  const cleanPrompt = userPrompt.trim().toLowerCase();
  
  // Professional photography/art enhancement terms
  const professionalTerms = [
    'professional photography',
    'high resolution',
    'sharp focus',
    'excellent composition',
    'professional lighting',
    'high quality',
    'detailed textures',
    'realistic rendering',
    'commercial grade'
  ];
  
  // Technical photography terms based on content type
  const technicalEnhancements = {
    portrait: 'portrait photography, shallow depth of field, professional studio lighting, sharp facial features, detailed skin texture',
    landscape: 'landscape photography, wide angle composition, natural lighting, rich colors, detailed foreground and background',
    product: 'product photography, clean background, professional lighting, high detail, commercial quality',
    workplace: 'corporate photography, professional environment, business setting, clean composition, professional attire',
    safety: 'industrial photography, safety equipment, professional workplace, clear documentation style, informative composition'
  };
  
  // Detect content type and apply appropriate enhancements
  let contentType = 'workplace'; // default for our use case
  if (cleanPrompt.includes('person') || cleanPrompt.includes('worker') || cleanPrompt.includes('employee')) {
    contentType = 'portrait';
  } else if (cleanPrompt.includes('equipment') || cleanPrompt.includes('tool') || cleanPrompt.includes('device')) {
    contentType = 'product';
  } else if (cleanPrompt.includes('safety') || cleanPrompt.includes('protection') || cleanPrompt.includes('ppe')) {
    contentType = 'safety';
  }
  
  // Build enhanced prompt
  let enhancedPrompt = `A ${technicalEnhancements[contentType as keyof typeof technicalEnhancements]}, ${userPrompt}`;
  
  // Add professional quality descriptors
  enhancedPrompt += ', professional quality, high resolution, excellent detail, sharp focus, optimal lighting';
  
  // Platform-specific enhancements
  if (platform === 'instagram') {
    enhancedPrompt += ', social media ready, engaging composition, vibrant colors';
  } else if (platform === 'linkedin') {
    enhancedPrompt += ', professional business setting, corporate appropriate, clean composition';
  }
  
  // Add final quality assurance terms
  enhancedPrompt += ', photorealistic, commercial photography style, professional grade';
  
  // Create negative prompt to avoid unwanted elements
  const negativePrompt = 'blurry, low quality, amateur, distorted, dark, unclear, unprofessional, messy background, poor lighting, artifacts, noise, pixelated, overexposed, underexposed';
  
  return {
    prompt: enhancedPrompt,
    negative_prompt: negativePrompt
  };
}

export async function generateImage(category: string, platform: 'instagram' | 'linkedin', customPrompt?: string): Promise<string> {
  const specs = BRIA_CONFIG.imageSpecs[platform];
  const basePrompt = customPrompt || IMAGE_GENERATION_PROMPTS[category as keyof typeof IMAGE_GENERATION_PROMPTS] || IMAGE_GENERATION_PROMPTS.prevencion;
  
  // Enhance the prompt for better BRIA results
  const { prompt, negative_prompt } = enhancePromptForBria(basePrompt, platform);
  
  const apiKey = process.env.BRIA_AI_API_KEY;

  if (!apiKey) {
    console.warn('BRIA_AI_API_KEY not found, using placeholder images');
    const { generatePlaceholderImage } = await import('@/lib/placeholder-images');
    return generatePlaceholderImage({ width: specs.width, height: specs.height, category, platform });
  }

  console.log(`Generating BRIA AI image - Category: ${category}, Platform: ${platform}`);
  console.log('Original prompt:', basePrompt.substring(0, 100) + '...');
  console.log('Enhanced prompt:', prompt.substring(0, 150) + '...');

  try {
    // Determine aspect ratio based on platform
    const aspectRatio = platform === 'instagram' ? '1:1' : '16:9';
    
    // BRIA API payload with advanced parameters for better results
    const payload = {
      prompt: prompt,
      negative_prompt: negative_prompt,
      num_results: 1,
      sync: true,
      aspect_ratio: aspectRatio,
      prompt_enhancement: true,  // Let BRIA further enhance our already enhanced prompt
      enhance_image: true,       // Generate images with richer details and sharper textures
      steps_num: 35,            // Higher steps for better quality (default is 30)
      text_guidance_scale: 6.5, // Higher adherence to prompt (default is 5)
      medium: 'photography',     // Specify photography medium for realistic results
      content_moderation: true,  // Enable content moderation
      ip_signal: true           // Flag potential IP content
    };

    // Use the exact endpoint from BRIA documentation with model version
    const endpoint = `${BRIA_CONFIG.baseUrl}/text-to-image/hd/${BRIA_CONFIG.modelVersion}`;
    const response = await makeBriaRequest(endpoint, payload, apiKey);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`BRIA API error (${response.status}):`, errorText);
      
      // Parse error response if it's JSON
      let errorDetails = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.message || errorJson.error || errorText;
      } catch (e) {
        // Not JSON, use raw text
      }
      
      throw new Error(`BRIA API error (${response.status}): ${errorDetails}`);
    }

    const data = await response.json();
    console.log('BRIA API raw response:', JSON.stringify(data, null, 2));

    // Check response structure according to BRIA documentation
    if (data && data.result && Array.isArray(data.result) && data.result.length > 0) {
      const result = data.result[0];
      
      // Look for image URL in various possible response formats
      let imageUrl = null;
      
      if (result.urls && Array.isArray(result.urls) && result.urls.length > 0) {
        imageUrl = result.urls[0];
      } else if (result.url) {
        imageUrl = result.url;
      } else if (result.image_url) {
        imageUrl = result.image_url;
      } else if (typeof result === 'string') {
        imageUrl = result;
      }
      
      if (imageUrl) {
        console.log('BRIA AI success! Image URL:', imageUrl);
        return imageUrl;
      }
    }
    
    // If we get here, the response structure is unexpected
    console.error('Unexpected BRIA API response structure:', data);
    throw new Error('Invalid response format from BRIA AI');

  } catch (error) {
    console.error('BRIA AI generation failed:', error);
    
    // Use placeholder image as fallback
    console.log('Using placeholder image fallback');
    const { generatePlaceholderImage } = await import('@/lib/placeholder-images');
    
    return generatePlaceholderImage({
      width: specs.width,
      height: specs.height,
      category,
      platform
    });
  }
}