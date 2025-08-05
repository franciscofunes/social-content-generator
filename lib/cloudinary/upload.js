import cloudinary, { CLOUDINARY_FOLDERS, UPLOAD_CONSTRAINTS } from './config.js';

/**
 * Upload image to Cloudinary from a file buffer
 * @param {Buffer|string} fileBuffer - File buffer or base64 string
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export async function uploadImage(fileBuffer, options = {}) {
  try {
    const {
      folder = CLOUDINARY_FOLDERS.GENERATED_IMAGES,
      tags = [],
      publicId,
      promptUsed,
      generationType,
      overwrite = false,
      userId,
    } = options;

    // Create metadata object
    const metadata = {
      uploaded_by: 'social-content-generator',
      generation_type: generationType || 'unknown',
      ...(userId && { user_id: userId }),
      ...(promptUsed && { prompt_used: promptUsed }),
      upload_timestamp: new Date().toISOString(),
    };

    // Upload configuration
    const uploadConfig = {
      folder,
      tags: ['social-content-generator', ...(userId ? [`user:${userId}`] : []), ...tags],
      context: metadata,
      overwrite,
      resource_type: 'image',
      quality: 'auto',
      format: 'auto',
      ...(publicId && { public_id: publicId }),
    };

    // Convert buffer to base64 if needed
    let uploadData = fileBuffer;
    if (Buffer.isBuffer(fileBuffer)) {
      uploadData = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
    }

    const result = await cloudinary.uploader.upload(uploadData, uploadConfig);

    return {
      success: true,
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        createdAt: result.created_at,
        tags: result.tags,
        folder: result.folder,
        metadata: result.context,
      },
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
}

/**
 * Upload image from URL
 * @param {string} imageUrl - Image URL to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export async function uploadImageFromUrl(imageUrl, options = {}) {
  try {
    const {
      folder = CLOUDINARY_FOLDERS.GENERATED_IMAGES,
      tags = [],
      publicId,
      promptUsed,
      generationType,
      userId,
    } = options;

    const metadata = {
      uploaded_by: 'social-content-generator',
      generation_type: generationType || 'unknown',
      source_url: imageUrl,
      ...(userId && { user_id: userId }),
      ...(promptUsed && { prompt_used: promptUsed }),
      upload_timestamp: new Date().toISOString(),
    };

    const uploadConfig = {
      folder,
      tags: ['social-content-generator', ...(userId ? [`user:${userId}`] : []), ...tags],
      context: metadata,
      resource_type: 'image',
      quality: 'auto',
      format: 'auto',
      ...(publicId && { public_id: publicId }),
    };

    const result = await cloudinary.uploader.upload(imageUrl, uploadConfig);

    return {
      success: true,
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        createdAt: result.created_at,
        tags: result.tags,
        folder: result.folder,
        metadata: result.context,
      },
    };
  } catch (error) {
    console.error('Cloudinary URL upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload from URL failed',
    };
  }
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<Object>} Delete result
 */
export async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    return {
      success: result.result === 'ok',
      data: result,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message || 'Delete failed',
    };
  }
}

/**
 * Get image details from Cloudinary
 * @param {string} publicId - Public ID of the image
 * @returns {Promise<Object>} Image details
 */
export async function getImageDetails(publicId) {
  try {
    const result = await cloudinary.api.resource(publicId, {
      context: true,
      tags: true,
    });

    return {
      success: true,
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        createdAt: result.created_at,
        tags: result.tags,
        folder: result.folder,
        metadata: result.context,
      },
    };
  } catch (error) {
    console.error('Cloudinary get details error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get image details',
    };
  }
}

/**
 * Search images in Cloudinary
 * @param {Object} searchOptions - Search parameters
 * @returns {Promise<Object>} Search results
 */
export async function searchImages(searchOptions = {}) {
  try {
    const {
      tags = [],
      folder,
      generationType,
      userId,
      limit = 50,
      sortBy = 'created_at:desc',
    } = searchOptions;

    let expression = 'resource_type:image AND folder:social-content-generator/*';
    
    if (userId) {
      expression += ` AND tags:user\\:${userId}`;
    }
    
    if (tags.length > 0) {
      expression += ` AND tags:(${tags.join(' OR ')})`;
    }
    
    if (folder) {
      expression += ` AND folder:${folder}`;
    }
    
    if (generationType) {
      expression += ` AND context.generation_type:${generationType}`;
    }

    const result = await cloudinary.search
      .expression(expression)
      .sort_by([{ [sortBy.split(':')[0]]: sortBy.split(':')[1] }])
      .max_results(limit)
      .with_field('context')
      .with_field('tags')
      .execute();

    return {
      success: true,
      data: {
        images: result.resources.map(resource => ({
          publicId: resource.public_id,
          url: resource.secure_url,
          width: resource.width,
          height: resource.height,
          format: resource.format,
          bytes: resource.bytes,
          createdAt: resource.created_at,
          tags: resource.tags,
          folder: resource.folder,
          metadata: resource.context,
        })),
        totalCount: result.total_count,
        nextCursor: result.next_cursor,
      },
    };
  } catch (error) {
    console.error('Cloudinary search error:', error);
    return {
      success: false,
      error: error.message || 'Search failed',
    };
  }
}

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
export function validateFile(file) {
  const errors = [];

  // Check file size
  if (file.size > UPLOAD_CONSTRAINTS.MAX_FILE_SIZE) {
    errors.push(`File size must be less than ${UPLOAD_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Check file type
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!UPLOAD_CONSTRAINTS.ALLOWED_FORMATS.includes(fileExtension)) {
    errors.push(`File format must be one of: ${UPLOAD_CONSTRAINTS.ALLOWED_FORMATS.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate optimized URL with transformations
 * @param {string} publicId - Public ID of the image
 * @param {Object} transformations - Transformation options
 * @returns {string} Optimized URL
 */
export function getOptimizedUrl(publicId, transformations = {}) {
  try {
    return cloudinary.url(publicId, {
      secure: true,
      quality: 'auto',
      format: 'auto',
      ...transformations,
    });
  } catch (error) {
    console.error('Error generating optimized URL:', error);
    return null;
  }
}