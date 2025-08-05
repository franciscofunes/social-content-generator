import { NextRequest, NextResponse } from 'next/server';
import { generateSocialContent } from '@/lib/apis/gemini';

export async function POST(request: NextRequest) {
  try {
    const { topic, imageUrl } = await request.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    console.log('Generating social content for topic:', topic);

    const [instagramContent, linkedinContent] = await Promise.all([
      generateSocialContent(topic, 'instagram', imageUrl),
      generateSocialContent(topic, 'linkedin', imageUrl)
    ]);

    return NextResponse.json({
      instagram: instagramContent,
      linkedin: linkedinContent,
      topic,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating social content:', error);
    return NextResponse.json(
      { error: 'Failed to generate social content' },
      { status: 500 }
    );
  }
}