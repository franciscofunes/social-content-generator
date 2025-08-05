import { NextRequest, NextResponse } from 'next/server';
import { searchImages, deleteImage, getImageDetails } from '@/lib/cloudinary/upload.js';

// GET - Search and list images
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const searchOptions = {
      tags: searchParams.get('tags') ? searchParams.get('tags').split(',') : [],
      folder: searchParams.get('folder') || undefined,
      generationType: searchParams.get('generationType') || undefined,
      limit: parseInt(searchParams.get('limit')) || 50,
      sortBy: searchParams.get('sortBy') || 'created_at:desc',
    };

    const result = await searchImages(searchOptions);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });

  } catch (error) {
    console.error('Images API GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an image
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID is required' },
        { status: 400 }
      );
    }

    const result = await deleteImage(publicId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });

  } catch (error) {
    console.error('Images API DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}