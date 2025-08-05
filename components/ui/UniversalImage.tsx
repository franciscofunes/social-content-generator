'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface UniversalImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
}

export function UniversalImage({
  src,
  alt,
  width,
  height,
  fill,
  className = '',
  sizes,
  onLoad,
  onError,
  style,
  ...props
}: UniversalImageProps) {
  const [imageType, setImageType] = useState<'raster' | 'svg' | 'unknown'>('unknown');
  const [imageError, setImageError] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');

  // Detect image type based on URL or content
  useEffect(() => {
    const detectImageType = async () => {
      try {
        // Check URL extension first
        const url = new URL(src, window.location.origin);
        const pathname = url.pathname.toLowerCase();
        
        if (pathname.endsWith('.svg')) {
          setImageType('svg');
          // Fetch SVG content
          try {
            const response = await fetch(src);
            if (response.ok) {
              const content = await response.text();
              setSvgContent(content);
            } else {
              setImageError(true);
            }
          } catch (error) {
            console.error('Error fetching SVG:', error);
            setImageError(true);
          }
          return;
        }
        
        // Check if it's a data URL with SVG
        if (src.startsWith('data:image/svg+xml')) {
          setImageType('svg');
          try {
            // Extract SVG content from data URL
            const base64Content = src.split(',')[1];
            const decodedContent = atob(base64Content);
            setSvgContent(decodedContent);
          } catch (error) {
            // Try URL decode for non-base64 data URLs
            try {
              const content = decodeURIComponent(src.split(',')[1]);
              setSvgContent(content);
            } catch (decodeError) {
              console.error('Error decoding SVG data URL:', decodeError);
              setImageError(true);
            }
          }
          return;
        }
        
        // Check if the response content type indicates SVG
        try {
          const response = await fetch(src, { method: 'HEAD' });
          const contentType = response.headers.get('content-type');
          
          if (contentType?.includes('image/svg+xml') || contentType?.includes('svg')) {
            setImageType('svg');
            // Fetch full content
            const fullResponse = await fetch(src);
            if (fullResponse.ok) {
              const content = await fullResponse.text();
              setSvgContent(content);
            } else {
              setImageError(true);
            }
          } else {
            setImageType('raster');
          }
        } catch (error) {
          // If we can't determine the type, assume it's a raster image
          setImageType('raster');
        }
      } catch (error) {
        console.error('Error detecting image type:', error);
        setImageType('raster');
      }
    };

    if (src) {
      detectImageType();
    }
  }, [src]);

  const handleImageLoad = () => {
    setImageError(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  // For SVG images
  if (imageType === 'svg' && svgContent && !imageError) {
    return (
      <div
        className={`svg-container ${className}`}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
        onLoad={handleImageLoad}
      />
    );
  }

  // For raster images or fallback
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={style}
        {...props}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 400}
      className={className}
      sizes={sizes}
      onLoad={handleImageLoad}
      onError={handleImageError}
      style={style}
      {...props}
    />
  );
}

// Helper function to determine if a URL is an SVG
export function isSVGUrl(url: string): boolean {
  try {
    const urlObj = new URL(url, window.location.origin);
    const pathname = urlObj.pathname.toLowerCase();
    return pathname.endsWith('.svg') || url.startsWith('data:image/svg+xml');
  } catch {
    return false;
  }
}

// Helper function to get image dimensions for SVG
export function getSVGDimensions(svgContent: string): { width: number; height: number } | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    
    if (svg) {
      const width = svg.getAttribute('width');
      const height = svg.getAttribute('height');
      const viewBox = svg.getAttribute('viewBox');
      
      if (width && height) {
        return {
          width: parseFloat(width),
          height: parseFloat(height)
        };
      } else if (viewBox) {
        const parts = viewBox.split(' ');
        if (parts.length === 4) {
          return {
            width: parseFloat(parts[2]),
            height: parseFloat(parts[3])
          };
        }
      }
    }
  } catch (error) {
    console.error('Error parsing SVG dimensions:', error);
  }
  
  return null;
}