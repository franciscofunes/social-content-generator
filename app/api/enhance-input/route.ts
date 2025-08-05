import { NextRequest, NextResponse } from 'next/server';

const GEMINI_CONFIG = {
  model: 'gemini-1.5-flash',
  maxTokens: 1000,
  temperature: 0.7,
};

async function makeGeminiRequest(prompt: string, maxRetries: number = 3): Promise<any> {
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
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before making more requests.');
        }
        
        if (response.status === 403 && errorText.includes('quota')) {
          throw new Error('API quota exceeded. Please check your Gemini API usage.');
        }
        
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response structure from Gemini API');
      }
      
      return data;
      
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error instanceof Error ? error.message : String(error));
      
      if (error instanceof Error && (error.message.includes('quota') || error.message.includes('authentication'))) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const backoffTime = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${backoffTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      } else {
        throw error;
      }
    }
  }
}

function generateSystemPrompt(platform: string, inputType: 'topic' | 'content' | 'instructions', language: string = 'en'): string {
  const platformSpecs = {
    instagram: {
      characteristics: 'Visual storytelling, lifestyle focus, aesthetic hashtags, engaging and authentic',
      audience: 'Younger demographics, visual-first consumers, lifestyle enthusiasts',
      features: 'Stories, Reels, Posts, IGTV'
    },
    linkedin: {
      characteristics: 'Professional tone, industry insights, thought leadership, business networking',
      audience: 'Business professionals, decision makers, industry experts',
      features: 'Professional updates, Articles, Events, Networking'
    },
    twitter: {
      characteristics: 'Concise and punchy, trending topics, real-time engagement, viral potential',
      audience: 'News-oriented users, thought leaders, real-time conversation participants',
      features: 'Tweets, Threads, Spaces, Moments'
    },
    facebook: {
      characteristics: 'Community engagement, storytelling approach, personal connection, longer form content',
      audience: 'Diverse age groups, community-focused users, family and friends networks',
      features: 'Posts, Stories, Events, Pages, Groups'
    },
    tiktok: {
      characteristics: 'Trend-aware, youthful tone, viral potential, creative and entertaining',
      audience: 'Gen Z and younger millennials, entertainment seekers, trend followers',
      features: 'Short videos, Trending sounds, Effects, Challenges'
    }
  };

  const spec = platformSpecs[platform as keyof typeof platformSpecs];
  if (!spec) {
    return 'You are an expert social media strategist. Enhance the user input to create compelling social media content.';
  }

  const languageInstructions = {
    en: 'Respond in English.',
    es: 'Responde en español.',
    fr: 'Répondre en français.',
    de: 'Antworte auf Deutsch.',
    it: 'Rispondi in italiano.',
    pt: 'Responda em português.'
  };

  const languageInstruction = languageInstructions[language as keyof typeof languageInstructions] || languageInstructions.en;

  if (inputType === 'topic') {
    return `You are a concise social media expert. Improve the user's topic to make it more engaging for ${platform}. Keep your response brief and focused.

REQUIREMENTS:
- Make it ${spec.characteristics}
- Appeal to ${spec.audience}
- Keep it concise (max 2-3 sentences)
- ${languageInstruction}

Transform the topic to be more compelling for ${platform}. Return ONLY the improved topic, nothing else.`;
  } else if (inputType === 'content') {
    return `You are a concise social media expert. Improve the user's content/message to be more engaging for ${platform}. Keep your response focused and actionable.

REQUIREMENTS:
- Make it ${spec.characteristics}
- Appeal to ${spec.audience}
- Keep it concise but comprehensive
- Add engaging elements appropriate for ${platform}
- ${languageInstruction}

Enhance the content to be more compelling and platform-optimized for ${platform}. Return ONLY the improved content, nothing else.`;
  } else {
    return `You are a concise social media expert. Improve the user's additional instructions for better ${platform} content. Keep your response brief and actionable.

REQUIREMENTS:
- Optimize for ${spec.characteristics}
- Target ${spec.audience}
- Keep it concise (max 3-4 bullet points)
- ${languageInstruction}

Enhance the instructions with specific ${platform} best practices. Return ONLY the improved instructions, nothing else.`;
  }
}

function generateFallbackEnhancement(input: string, platform: string, inputType: 'topic' | 'instructions'): string {
  if (inputType === 'topic') {
    const platformEnhancements = {
      instagram: `Visual storytelling concept: ${input}. Create engaging visual narrative with behind-the-scenes elements, user-generated content opportunities, and aesthetic appeal that encourages saves and shares. Include lifestyle integration and authentic moments that resonate with Instagram's visual-first audience.`,
      linkedin: `Professional insight on ${input}. Develop thought leadership angle with industry analysis, data-driven insights, and actionable business strategies. Include professional development aspects, market trends, and networking opportunities that provide value to business professionals and decision makers.`,
      twitter: `Trending discussion about ${input}. Create conversation-starting content with real-time relevance, industry hot takes, and community engagement elements. Include newsworthy angles and bite-sized insights that encourage retweets and replies.`,
      facebook: `Community-focused content about ${input}. Develop storytelling approach with personal connections, community building elements, and longer-form narrative that encourages meaningful discussions and sharing within social circles.`,
      tiktok: `Creative trend concept: ${input}. Design entertaining and educational content with viral potential, trending audio integration, and creative visual elements that appeal to younger audiences and encourage duets and shares.`
    };
    return platformEnhancements[platform as keyof typeof platformEnhancements] || `Enhanced topic concept: ${input} with engaging narrative, audience value, and platform-optimized approach.`;
  } else {
    const platformInstructions = {
      instagram: `${input} Focus on visual storytelling with high-quality imagery, aesthetic consistency, and engaging captions. Use relevant hashtags strategically, include stories and reels opportunities, encourage user-generated content, and maintain authentic brand voice that builds community.`,
      linkedin: `${input} Maintain professional tone with thought leadership approach. Include industry insights, data points, and actionable advice. Use proper business formatting, professional networking calls-to-action, and establish credibility through expertise demonstration.`,
      twitter: `${input} Keep content concise and impactful. Include trending hashtags appropriately, encourage retweets through valuable insights, use threading for longer thoughts, and maintain real-time relevance with timely commentary.`,
      facebook: `${input} Create community-engaging content with storytelling elements. Encourage comments and shares through questions and relatable content. Use proper formatting for readability and include calls-to-action that build community connections.`,
      tiktok: `${input} Make content entertaining and trend-aware. Include popular audio when relevant, use engaging visual elements, create content that encourages duets and stitches, and maintain youthful, creative energy.`
    };
    return platformInstructions[platform as keyof typeof platformInstructions] || `${input} Enhanced with platform-specific optimization, engagement strategies, and audience-focused approach.`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { input, platform, inputType, language = 'en' } = await request.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }

    if (!platform || typeof platform !== 'string') {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      );
    }

    if (!inputType || !['topic', 'content', 'instructions'].includes(inputType)) {
      return NextResponse.json(
        { error: 'Input type must be "topic", "content", or "instructions"' },
        { status: 400 }
      );
    }

    console.log(`Enhancing ${inputType} for ${platform}:`, input);

    try {
      const systemPrompt = generateSystemPrompt(platform, inputType, language);
      const data = await makeGeminiRequest(systemPrompt + '\n\nUser input: ' + input);
      const enhancedInput = data.candidates[0].content.parts[0].text.trim();

      return NextResponse.json({
        enhancedInput,
        originalInput: input,
        platform,
        inputType
      });

    } catch (geminiError) {
      console.error('Gemini API error, using fallback:', geminiError);
      
      const fallbackEnhancement = generateFallbackEnhancement(input, platform, inputType);
      
      return NextResponse.json({
        enhancedInput: fallbackEnhancement,
        originalInput: input,
        platform,
        inputType,
        usingFallback: true
      });
    }

  } catch (error) {
    console.error('Error enhancing input:', error);
    return NextResponse.json(
      { error: 'Failed to enhance input' },
      { status: 500 }
    );
  }
}