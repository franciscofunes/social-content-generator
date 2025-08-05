import { NextRequest, NextResponse } from 'next/server';
import { 
  applyTransformations, 
  getPresetUrl, 
  generateResponsiveSizes,
  generateSocialMediaSizes,
  applyAIEnhancements,
  addTextOverlay,
  generateVariants
} from '@/lib/cloudinary/transform.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { publicId, action, options = {} } = body;

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID is required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'transform':
        result = applyTransformations(publicId, options);
        break;

      case 'preset':
        const { preset } = options;
        if (!preset) {
          return NextResponse.json(
            { success: false, error: 'Preset name is required' },
            { status: 400 }
          );
        }
        result = getPresetUrl(publicId, preset);
        break;

      case 'responsive':
        result = generateResponsiveSizes(publicId, options.sizes);
        break;

      case 'social':
        result = generateSocialMediaSizes(publicId);
        break;

      case 'ai-enhance':
        result = applyAIEnhancements(publicId, options);
        break;

      case 'text-overlay':
        const { text } = options;
        if (!text) {
          return NextResponse.json(
            { success: false, error: 'Text is required for overlay' },
            { status: 400 }
          );
        }
        result = addTextOverlay(publicId, options);
        break;

      case 'variants':
        result = generateVariants(publicId, options.variants);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Transformation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { url: result, urls: result },
    });

  } catch (error) {
    console.error('Transform API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}