import { NextRequest, NextResponse } from 'next/server';
import { loadImagesFromFirestore, deleteImageFromFirestore } from '@/lib/firestore-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log(`Loading images for user: ${userId}, limit: ${limit}`);

    const images = await loadImagesFromFirestore(userId, limit);

    return NextResponse.json({
      success: true,
      data: {
        images,
        total: images.length
      }
    });

  } catch (error) {
    console.error('Error loading images:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to load images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');
    const userId = searchParams.get('userId');

    if (!imageId || !userId) {
      return NextResponse.json(
        { error: 'Image ID and User ID are required' },
        { status: 400 }
      );
    }

    console.log(`Deleting image: ${imageId} for user: ${userId}`);

    await deleteImageFromFirestore(imageId, userId);

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}