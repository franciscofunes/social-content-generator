# Cloudinary Integration Setup Guide

## Overview
This guide will help you set up Cloudinary integration for your Next.js Content Generator application. The integration provides powerful image upload, storage, transformation, and management capabilities.

## Prerequisites
- Cloudinary account (free tier available)
- Next.js application
- Environment variables access

## 1. Cloudinary Account Setup

### Step 1: Create Upload Preset
1. Log into your Cloudinary Dashboard
2. Go to Settings → Upload
3. Scroll down to "Upload presets"
4. Click "Add upload preset"
5. Configure the preset:
   - **Preset name**: `previnnova_upload`
   - **Signing Mode**: Unsigned
   - **Folder**: `previnnova/generated-images`
   - **Auto-create folders**: Yes
   - **Unique filename**: Yes
   - **Overwrite**: No

### Step 2: Configure Folders
The application uses organized folder structure:
- `previnnova/generated-images` - AI-generated images
- `previnnova/user-uploads` - Manually uploaded images
- `previnnova/social-content` - Social media optimized images

### Step 3: Get API Credentials
From your Cloudinary Dashboard → Settings → API Keys:
- Cloud Name: `dtycadss0` (already configured)
- API Key: `424957342563834` (already configured)
- API Secret: `KGlGajjydm30YQ2G3092PZcpV8I` (already configured)

## 2. Environment Configuration

Your `.env.local` file should contain:

```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dtycadss0
CLOUDINARY_API_KEY=424957342563834
CLOUDINARY_API_SECRET=KGlGajjydm30YQ2G3092PZcpV8I
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=previnnova_upload
```

## 3. Package Installation

The following packages are already added to your `package.json`:

```bash
npm install cloudinary next-cloudinary
```

## 4. Features Implemented

### Core Upload Features
- ✅ **Direct Image Upload**: Upload generated images to Cloudinary
- ✅ **URL-based Upload**: Upload images from external URLs (BRIA AI)
- ✅ **File Validation**: Size, format, and dimension checks
- ✅ **Progress Tracking**: Visual upload progress indicators
- ✅ **Error Handling**: Comprehensive error management

### Image Management
- ✅ **Gallery View**: Grid and list view modes
- ✅ **Search & Filter**: Search by prompts, tags, or metadata
- ✅ **Image Details**: Full metadata display
- ✅ **Delete Images**: Safe deletion with confirmation
- ✅ **Download**: Direct download from Cloudinary CDN

### Integration Points
- ✅ **Image Generator**: One-click upload after generation
- ✅ **Chat History**: Integration with Firebase chat system
- ✅ **Mobile Optimized**: Touch-friendly mobile interface
- ✅ **Responsive Design**: Works on all screen sizes

## 5. API Endpoints

### Upload API (`/api/cloudinary/upload`)
- **POST**: Upload images (multipart/form-data or JSON)
- **GET**: Get upload configuration

```javascript
// Upload from URL (for generated images)
fetch('/api/cloudinary/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageUrl: 'https://example.com/image.jpg',
    prompt: 'Image generation prompt',
    generationType: 'image',
    tags: ['generated', 'ai']
  })
});

// Upload file
const formData = new FormData();
formData.append('file', fileObject);
formData.append('prompt', 'Description');
formData.append('generationType', 'manual_upload');

fetch('/api/cloudinary/upload', {
  method: 'POST',
  body: formData
});
```

### Images API (`/api/cloudinary/images`)
- **GET**: List and search images
- **DELETE**: Delete specific image

```javascript
// Get images with filters
fetch('/api/cloudinary/images?generationType=image&limit=20&sortBy=created_at:desc');

// Delete image
fetch('/api/cloudinary/images?publicId=previnnova/generated-images/abc123', {
  method: 'DELETE'
});
```

### Transform API (`/api/cloudinary/transform`)
- **POST**: Apply transformations to images

```javascript
// Apply transformations
fetch('/api/cloudinary/transform', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    publicId: 'previnnova/generated-images/abc123',
    action: 'social',
    options: {}
  })
});
```

## 6. Components Usage

### UploadButton Component
```jsx
import { UploadButton } from '@/components/cloudinary/UploadButton';

<UploadButton
  imageUrl="https://example.com/image.jpg"
  prompt="Generated image prompt"
  generationType="image"
  onUploadSuccess={(data) => console.log('Uploaded:', data)}
  onUploadError={(error) => console.error('Error:', error)}
/>
```

### ImageGallery Component
```jsx
import { ImageGallery } from '@/components/cloudinary/ImageGallery';

// Full-featured gallery with search, filters, and management
<ImageGallery />
```

### UploadModal Component
```jsx
import { UploadModal } from '@/components/cloudinary/UploadModal';

<UploadModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onUploadSuccess={(data) => console.log('Uploaded:', data)}
/>
```

## 7. Image Transformations

### Preset Transformations
- **Thumbnail**: 300x300 cropped
- **Medium**: 800x600 limited
- **Social Instagram**: 1080x1080 square
- **Social LinkedIn**: 1200x630 landscape

### Custom Transformations
```javascript
import { applyTransformations } from '@/lib/cloudinary/transform';

// Apply custom transformation
const transformedUrl = applyTransformations('image-public-id', {
  width: 800,
  height: 600,
  crop: 'fill',
  quality: 'auto',
  format: 'webp'
});
```

## 8. File Structure

```
lib/cloudinary/
├── config.js          # Cloudinary configuration
├── upload.js          # Upload utilities
└── transform.js       # Transformation helpers

components/cloudinary/
├── UploadButton.jsx   # Upload interface
├── UploadModal.jsx    # Drag-drop modal
└── ImageGallery.jsx   # Gallery component

app/api/cloudinary/
├── upload/route.js    # Upload API
├── images/route.js    # Image management API
└── transform/route.js # Transformation API

app/gallery/
└── page.tsx          # Gallery page
```

## 9. Usage Examples

### Basic Upload After Image Generation
```javascript
// In your image generation component
const handleImageGenerated = async (imageUrl, prompt) => {
  // Image is automatically available for upload via UploadButton
  // Users can click "Upload to Cloud" to save to Cloudinary
};
```

### Programmatic Upload
```javascript
import { uploadImageFromUrl } from '@/lib/cloudinary/upload';

const uploadToCloudinary = async (imageUrl, prompt) => {
  const result = await uploadImageFromUrl(imageUrl, {
    folder: 'previnnova/generated-images',
    tags: ['ai-generated', 'prompt-based'],
    promptUsed: prompt,
    generationType: 'image'
  });

  if (result.success) {
    console.log('Uploaded:', result.data.url);
  }
};
```

### Gallery Integration
```javascript
// Gallery is accessible at /gallery route
// Also available via navigation buttons in the app
```

## 10. Mobile Optimization

The Cloudinary integration is fully mobile-optimized:
- Touch-friendly upload buttons (48px minimum)
- Responsive gallery grid
- Mobile drag-and-drop support
- Optimized image loading
- Safe area support for notched devices

## 11. Security Features

- File type validation (JPEG, PNG, WebP, GIF)
- File size limits (10MB maximum)
- Server-side validation
- Signed uploads for sensitive content
- User-based access control

## 12. Performance Features

- CDN delivery via Cloudinary
- Automatic format optimization (WebP, AVIF)
- Lazy loading for gallery
- Progressive image loading
- Optimized transformations

## 13. Troubleshooting

### Common Issues

**Upload fails with "Invalid credentials"**
- Check environment variables are set correctly
- Verify upload preset exists and is unsigned

**Images not appearing in gallery**
- Check folder structure in Cloudinary dashboard
- Verify API routes are accessible
- Check browser console for errors

**Slow uploads**
- Enable automatic quality optimization
- Check file sizes (max 10MB)
- Verify network connection

### Debug Mode
Enable debug logs by adding to your `.env.local`:
```bash
NEXT_PUBLIC_DEBUG_CLOUDINARY=true
```

## 14. Next Steps

The integration is production-ready with these features:
- ✅ Complete upload workflow
- ✅ Image management gallery
- ✅ Mobile-optimized interface
- ✅ Error handling and validation
- ✅ Integration with existing chat system

### Potential Enhancements
- Batch upload functionality
- Advanced transformation presets
- AI-powered auto-tagging
- Social media scheduling
- Analytics and usage tracking

## Support

For Cloudinary-specific issues:
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Support](https://support.cloudinary.com/)

For integration issues:
- Check the browser console for errors
- Verify API endpoints are responding
- Test with smaller image files first