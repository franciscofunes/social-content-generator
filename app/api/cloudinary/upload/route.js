import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, uploadImageFromUrl, validateFile } from '@/lib/cloudinary/upload.js';
import { CLOUDINARY_FOLDERS } from '@/lib/cloudinary/config.js';

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let uploadResult;

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get('file');
      const prompt = formData.get('prompt') || '';
      const generationType = formData.get('generationType') || 'upload';
      const tags = formData.get('tags') ? formData.get('tags').split(',') : [];

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file provided' },
          { status: 400 }
        );
      }

      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, error: validation.errors.join(', ') },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload options
      const uploadOptions = {
        folder: CLOUDINARY_FOLDERS.USER_UPLOADS,
        tags: [...tags, generationType],
        promptUsed: prompt,
        generationType,
      };

      uploadResult = await uploadImage(buffer, uploadOptions);

    } else if (contentType.includes('application/json')) {
      // Handle URL upload
      const body = await request.json();
      const { imageUrl, prompt, generationType = 'generated', tags = [] } = body;

      if (!imageUrl) {
        return NextResponse.json(
          { success: false, error: 'No image URL provided' },
          { status: 400 }
        );
      }

      // Upload options
      const uploadOptions = {
        folder: CLOUDINARY_FOLDERS.GENERATED_IMAGES,
        tags: [...tags, generationType],
        promptUsed: prompt,
        generationType,
      };

      uploadResult = await uploadImageFromUrl(imageUrl, uploadOptions);

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid content type' },
        { status: 400 }
      );
    }

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: uploadResult.data,
      message: 'Image uploaded successfully',
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET request to get upload configuration
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    },
  });
}