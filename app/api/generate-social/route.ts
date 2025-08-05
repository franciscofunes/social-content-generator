import { NextRequest, NextResponse } from 'next/server';
import { generateSocialContent } from '@/lib/apis/gemini';
import { detectLanguage } from '@/lib/utils/language';

export async function POST(request: NextRequest) {
  try {
    const { 
      topic, 
      platforms = ['instagram', 'linkedin'],
      contentType = 'promotional',
      tone = 'professional',
      customInstructions,
      languageOverride,
      imageUrl 
    } = await request.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required and must be a string' },
        { status: 400 }
      );
    }

    if (!Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: 'At least one platform must be specified' },
        { status: 400 }
      );
    }

    console.log('Generating enhanced social content:', {
      topic: topic.substring(0, 100) + '...',
      platforms,
      contentType,
      tone,
      languageOverride
    });

    // Auto-detect language if not overridden
    const detectedLanguage = detectLanguage(topic);
    
    const generatedContent = await generateSocialContent(
      topic,
      platforms,
      {
        contentType,
        tone,
        customInstructions,
        detectedLanguage,
        languageOverride,
        imageUrl
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        generatedContent,
        settings: {
          topic,
          platforms,
          contentType,
          tone,
          customInstructions,
          detectedLanguage,
          languageOverride,
          imageUrl
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating social content:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate social content',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}