import { v2 as cloudinary } from 'cloudinary';

// Server-side Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS
});

export default cloudinary;

// Client-side configuration object
export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
};

// Folder configuration for organized uploads
export const CLOUDINARY_FOLDERS = {
  GENERATED_IMAGES: 'previnnova/generated-images',
  USER_UPLOADS: 'previnnova/user-uploads',
  SOCIAL_CONTENT: 'previnnova/social-content',
  TEMP: 'previnnova/temp',
};

// Default transformation presets
export const TRANSFORMATION_PRESETS = {
  THUMBNAIL: {
    width: 300,
    height: 300,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  },
  MEDIUM: {
    width: 800,
    height: 600,
    crop: 'limit',
    quality: 'auto',
    format: 'auto',
  },
  SOCIAL_INSTAGRAM: {
    width: 1080,
    height: 1080,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  },
  SOCIAL_LINKEDIN: {
    width: 1200,
    height: 630,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  },
  ORIGINAL: {
    quality: 'auto',
    format: 'auto',
  },
};

// Allowed file types and sizes
export const UPLOAD_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  MAX_WIDTH: 4000,
  MAX_HEIGHT: 4000,
};