import cloudinary, { TRANSFORMATION_PRESETS } from './config.js';

/**
 * Apply transformations to an image
 * @param {string} publicId - Public ID of the image
 * @param {Object} transformations - Transformation parameters
 * @returns {string} Transformed image URL
 */
export function applyTransformations(publicId, transformations = {}) {
  try {
    return cloudinary.url(publicId, {
      secure: true,
      ...transformations,
    });
  } catch (error) {
    console.error('Error applying transformations:', error);
    return null;
  }
}

/**
 * Get preset transformation URL
 * @param {string} publicId - Public ID of the image
 * @param {string} preset - Preset name from TRANSFORMATION_PRESETS
 * @returns {string} Transformed image URL
 */
export function getPresetUrl(publicId, preset) {
  const presetConfig = TRANSFORMATION_PRESETS[preset];
  if (!presetConfig) {
    console.error(`Unknown preset: ${preset}`);
    return null;
  }

  return applyTransformations(publicId, presetConfig);
}

/**
 * Generate multiple sizes for responsive images
 * @param {string} publicId - Public ID of the image
 * @param {Array} sizes - Array of size configurations
 * @returns {Object} Object with different sized URLs
 */
export function generateResponsiveSizes(publicId, sizes = []) {
  const defaultSizes = [
    { name: 'thumbnail', width: 300, height: 300 },
    { name: 'small', width: 600, height: 400 },
    { name: 'medium', width: 1000, height: 667 },
    { name: 'large', width: 1500, height: 1000 },
  ];

  const sizesToGenerate = sizes.length > 0 ? sizes : defaultSizes;
  const responsiveImages = {};

  sizesToGenerate.forEach(size => {
    responsiveImages[size.name] = applyTransformations(publicId, {
      width: size.width,
      height: size.height,
      crop: size.crop || 'limit',
      quality: 'auto',
      format: 'auto',
    });
  });

  return responsiveImages;
}

/**
 * Generate social media optimized images
 * @param {string} publicId - Public ID of the image
 * @returns {Object} Social media optimized URLs
 */
export function generateSocialMediaSizes(publicId) {
  return {
    instagram: {
      square: applyTransformations(publicId, TRANSFORMATION_PRESETS.SOCIAL_INSTAGRAM),
      story: applyTransformations(publicId, {
        width: 1080,
        height: 1920,
        crop: 'fill',
        quality: 'auto',
        format: 'auto',
      }),
    },
    linkedin: {
      post: applyTransformations(publicId, TRANSFORMATION_PRESETS.SOCIAL_LINKEDIN),
      cover: applyTransformations(publicId, {
        width: 1584,
        height: 396,
        crop: 'fill',
        quality: 'auto',
        format: 'auto',
      }),
    },
    facebook: {
      post: applyTransformations(publicId, {
        width: 1200,
        height: 630,
        crop: 'fill',
        quality: 'auto',
        format: 'auto',
      }),
      cover: applyTransformations(publicId, {
        width: 851,
        height: 315,
        crop: 'fill',
        quality: 'auto',
        format: 'auto',
      }),
    },
    twitter: {
      post: applyTransformations(publicId, {
        width: 1024,
        height: 512,
        crop: 'fill',
        quality: 'auto',
        format: 'auto',
      }),
    },
  };
}

/**
 * Apply AI-powered enhancements
 * @param {string} publicId - Public ID of the image
 * @param {Object} enhancements - Enhancement options
 * @returns {string} Enhanced image URL
 */
export function applyAIEnhancements(publicId, enhancements = {}) {
  const {
    improve = false,
    upscale = false,
    removeBackground = false,
    autoColor = false,
    autoContrast = false,
  } = enhancements;

  let transformations = {};

  if (improve) {
    transformations.effect = 'improve';
  }

  if (upscale) {
    transformations.effect = transformations.effect 
      ? `${transformations.effect}:upscale` 
      : 'upscale';
  }

  if (removeBackground) {
    transformations.background = 'transparent';
    transformations.effect = transformations.effect 
      ? `${transformations.effect}:bgremoval` 
      : 'bgremoval';
  }

  if (autoColor) {
    transformations.effect = transformations.effect 
      ? `${transformations.effect}:auto_color` 
      : 'auto_color';
  }

  if (autoContrast) {
    transformations.effect = transformations.effect 
      ? `${transformations.effect}:auto_contrast` 
      : 'auto_contrast';
  }

  return applyTransformations(publicId, transformations);
}

/**
 * Add text overlay to image
 * @param {string} publicId - Public ID of the image
 * @param {Object} textOptions - Text overlay options
 * @returns {string} Image URL with text overlay
 */
export function addTextOverlay(publicId, textOptions = {}) {
  const {
    text,
    fontFamily = 'Arial',
    fontSize = 60,
    fontWeight = 'bold',
    color = 'white',
    position = 'center',
    stroke = 'black',
    strokeWidth = 2,
  } = textOptions;

  if (!text) {
    console.error('Text is required for text overlay');
    return null;
  }

  const overlay = {
    overlay: {
      font_family: fontFamily,
      font_size: fontSize,
      font_weight: fontWeight,
      text: text,
    },
    color: color,
    gravity: position,
  };

  if (stroke && strokeWidth) {
    overlay.border = `${strokeWidth}px_solid_${stroke}`;
  }

  return applyTransformations(publicId, overlay);
}

/**
 * Create image collage
 * @param {Array} images - Array of image objects with publicId and transformations
 * @param {Object} collageOptions - Collage configuration
 * @returns {string} Collage image URL
 */
export function createCollage(images, collageOptions = {}) {
  const {
    width = 1200,
    height = 800,
    background = 'white',
  } = collageOptions;

  if (!images || images.length === 0) {
    console.error('Images array is required for collage');
    return null;
  }

  // This is a simplified collage - for complex layouts, you might need to use Cloudinary's advanced features
  const baseTransformations = {
    width,
    height,
    crop: 'fill',
    background,
  };

  // For now, return the first image with base transformations
  // In a full implementation, you'd use Cloudinary's layering features
  return applyTransformations(images[0].publicId, baseTransformations);
}

/**
 * Generate image variants for A/B testing
 * @param {string} publicId - Public ID of the image
 * @param {Array} variants - Array of variant configurations
 * @returns {Object} Object with variant URLs
 */
export function generateVariants(publicId, variants = []) {
  const defaultVariants = [
    { name: 'original', transformations: {} },
    { name: 'bright', transformations: { effect: 'brightness:30' } },
    { name: 'contrast', transformations: { effect: 'contrast:30' } },
    { name: 'saturated', transformations: { effect: 'saturation:30' } },
    { name: 'vintage', transformations: { effect: 'sepia:50' } },
  ];

  const variantsToGenerate = variants.length > 0 ? variants : defaultVariants;
  const variantImages = {};

  variantsToGenerate.forEach(variant => {
    variantImages[variant.name] = applyTransformations(publicId, variant.transformations);
  });

  return variantImages;
}

/**
 * Analyze image and get insights
 * @param {string} publicId - Public ID of the image
 * @returns {Promise<Object>} Image analysis results
 */
export async function analyzeImage(publicId) {
  try {
    // Get image details with AI analysis
    const result = await cloudinary.api.resource(publicId, {
      colors: true,
      faces: true,
      quality_analysis: true,
      accessibility_analysis: true,
      cinemagraph_analysis: true,
    });

    return {
      success: true,
      data: {
        colors: result.colors,
        faces: result.faces,
        quality: result.quality_analysis,
        accessibility: result.accessibility_analysis,
        tags: result.tags,
        metadata: result.context,
      },
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      success: false,
      error: error.message || 'Image analysis failed',
    };
  }
}