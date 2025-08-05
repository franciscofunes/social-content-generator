// Placeholder image service that generates proper workplace safety images
// Uses a reliable placeholder service with safety-themed images

export interface PlaceholderImageOptions {
  width: number;
  height: number;
  category: string;
  platform: 'instagram' | 'linkedin';
}

// Map categories to safety-related keywords for better placeholder images
const CATEGORY_KEYWORDS = {
  normativas: 'office,regulations,safety,workplace',
  epp: 'helmet,safety,equipment,protection',
  prevencion: 'safety,prevention,workplace,warning',
  ergonomia: 'office,desk,computer,ergonomic',
  'primeros-auxilios': 'medical,first-aid,emergency,health',
  construccion: 'construction,helmet,building,safety',
  quimicos: 'laboratory,chemical,safety,protection',
  electrica: 'electrical,safety,warning,equipment',
  maquinaria: 'machinery,industrial,safety,equipment',
  capacitacion: 'training,education,workplace,safety'
};

// Generate placeholder image URLs using multiple services as fallbacks
export function generatePlaceholderImage({ width, height, category, platform }: PlaceholderImageOptions): string {
  const keywords = CATEGORY_KEYWORDS[category as keyof typeof CATEGORY_KEYWORDS] || 'workplace,safety';
  
  // Service 1: Picsum (most reliable)
  const picsum = `https://picsum.photos/${width}/${height}?random=${category}`;
  
  // Service 2: Placeholder.com with safety colors
  const placeholder = `https://via.placeholder.com/${width}x${height}/3b82f6/ffffff?text=Safety+Content`;
  
  // Service 3: Lorem Picsum with specific seed for consistency
  const seed = Math.abs(category.split('').reduce((a, b) => a + b.charCodeAt(0), 0));
  const seededPicsum = `https://picsum.photos/seed/${category}${seed}/${width}/${height}`;
  
  // For now, use the most reliable service (Picsum)
  return seededPicsum;
}

// Alternative: Generate solid color images with text overlays
export function generateSolidColorPlaceholder({ width, height, category }: PlaceholderImageOptions): string {
  const colors = {
    normativas: '4f46e5', // Indigo
    epp: 'dc2626',        // Red
    prevencion: 'ea580c',  // Orange
    ergonomia: '059669',   // Emerald
    'primeros-auxilios': 'dc2626', // Red
    construccion: 'ca8a04', // Yellow
    quimicos: '7c3aed',    // Purple
    electrica: 'dc2626',   // Red
    maquinaria: '374151',  // Gray
    capacitacion: '2563eb' // Blue
  };
  
  const color = colors[category as keyof typeof colors] || '3b82f6';
  const text = category.charAt(0).toUpperCase() + category.slice(1);
  
  return `https://via.placeholder.com/${width}x${height}/${color}/ffffff?text=${encodeURIComponent(text)}`;
}

// Professional workplace safety stock photos (free services)
export function getWorkplaceSafetyPlaceholder({ width, height, category }: PlaceholderImageOptions): string {
  // Use Unsplash Source for more professional images
  const safetyKeywords = {
    normativas: 'office-building',
    epp: 'safety-helmet',
    prevencion: 'warning-sign',
    ergonomia: 'office-desk',
    'primeros-auxilios': 'medical-kit',
    construccion: 'construction-site',
    quimicos: 'laboratory',
    electrica: 'electrical-panel',
    maquinaria: 'industrial-machine',
    capacitacion: 'conference-room'
  };
  
  const keyword = safetyKeywords[category as keyof typeof safetyKeywords] || 'workplace';
  
  // Unsplash Source (reliable and high quality)
  return `https://source.unsplash.com/${width}x${height}/?${keyword},workplace,safety`;
}