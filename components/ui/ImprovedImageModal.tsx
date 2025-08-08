'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  ArrowLeft, 
  ArrowRight,
  Copy,
  Maximize2,
  Minimize2,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { UniversalImage, isSVGUrl } from './UniversalImage';

interface ImageData {
  id: string;
  imageUrl: string;
  prompt: string;
  modelType?: string;
  createdAt?: string;
}

interface ImprovedImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageData[];
  currentIndex: number;
  onIndexChange?: (index: number) => void;
  onDelete?: (imageId: string) => void;
}

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 6];
const DEFAULT_ZOOM_INDEX = 3; // 100%

export function ImprovedImageModal({ 
  isOpen, 
  onClose, 
  images, 
  currentIndex, 
  onIndexChange,
  onDelete 
}: ImprovedImageModalProps) {
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [initialTouchCenter, setInitialTouchCenter] = useState({ x: 0, y: 0 });
  const [showMobileNavigation, setShowMobileNavigation] = useState(false);
  const [showInitialHint, setShowInitialHint] = useState(false);
  const mobileNavTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];
  const currentZoom = ZOOM_LEVELS[zoomIndex];
  const canZoomIn = zoomIndex < ZOOM_LEVELS.length - 1;
  const canZoomOut = zoomIndex > 0;
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < images.length - 1;

  // Reset zoom and position when modal opens or image changes
  useEffect(() => {
    if (isOpen) {
      setZoomIndex(DEFAULT_ZOOM_INDEX);
      setImageLoaded(false);
      setImagePosition({ x: 0, y: 0 });
      setIsDragging(false);
      document.body.style.overflow = 'hidden';
      
      // Show navigation hint on mobile devices when there are multiple images
      if (images.length > 1 && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
        setShowInitialHint(true);
        hintTimeoutRef.current = setTimeout(() => {
          setShowInitialHint(false);
        }, 2500);
      }
    } else {
      document.body.style.overflow = 'unset';
      setShowMobileNavigation(false);
      setShowInitialHint(false);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentIndex, images.length]);

  // Keyboard navigation and zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (canGoPrevious) goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (canGoNext) goToNext();
          break;
        case '+':
        case '=':
          e.preventDefault();
          if (canZoomIn) handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          if (canZoomOut) handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, canGoPrevious, canGoNext, canZoomIn, canZoomOut]);

  // Mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isOpen || !imageContainerRef.current?.contains(e.target as Node)) return;
      
      e.preventDefault();
      
      if (e.deltaY < 0 && canZoomIn) {
        handleZoomIn(e.clientX, e.clientY);
      } else if (e.deltaY > 0 && canZoomOut) {
        handleZoomOut(e.clientX, e.clientY);
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, [isOpen, canZoomIn, canZoomOut, zoomIndex]);


  const goToPrevious = useCallback(() => {
    if (canGoPrevious) {
      const newIndex = currentIndex - 1;
      onIndexChange?.(newIndex);
    }
  }, [canGoPrevious, currentIndex, onIndexChange]);

  const goToNext = useCallback(() => {
    if (canGoNext) {
      const newIndex = currentIndex + 1;
      onIndexChange?.(newIndex);
    }
  }, [canGoNext, currentIndex, onIndexChange]);

  // Handle mobile navigation visibility
  const showMobileNavigationWithTimeout = useCallback(() => {
    setShowMobileNavigation(true);
    
    if (mobileNavTimeoutRef.current) {
      clearTimeout(mobileNavTimeoutRef.current);
    }
    
    mobileNavTimeoutRef.current = setTimeout(() => {
      setShowMobileNavigation(false);
    }, 3000); // Hide after 3 seconds
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (mobileNavTimeoutRef.current) {
        clearTimeout(mobileNavTimeoutRef.current);
      }
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
    };
  }, []);

  const handleZoomIn = (centerX?: number, centerY?: number) => {
    if (canZoomIn) {
      const newZoomIndex = zoomIndex + 1;
      const newZoom = ZOOM_LEVELS[newZoomIndex];
      const oldZoom = currentZoom;
      
      if (centerX !== undefined && centerY !== undefined && imageContainerRef.current) {
        const rect = imageContainerRef.current.getBoundingClientRect();
        const offsetX = centerX - rect.left - rect.width / 2;
        const offsetY = centerY - rect.top - rect.height / 2;
        
        setImagePosition({
          x: imagePosition.x - offsetX * (newZoom - oldZoom) / oldZoom,
          y: imagePosition.y - offsetY * (newZoom - oldZoom) / oldZoom,
        });
      }
      
      setZoomIndex(newZoomIndex);
    }
  };

  const handleZoomOut = (centerX?: number, centerY?: number) => {
    if (canZoomOut) {
      const newZoomIndex = zoomIndex - 1;
      const newZoom = ZOOM_LEVELS[newZoomIndex];
      const oldZoom = currentZoom;
      
      if (centerX !== undefined && centerY !== undefined && imageContainerRef.current) {
        const rect = imageContainerRef.current.getBoundingClientRect();
        const offsetX = centerX - rect.left - rect.width / 2;
        const offsetY = centerY - rect.top - rect.height / 2;
        
        setImagePosition({
          x: imagePosition.x - offsetX * (newZoom - oldZoom) / oldZoom,
          y: imagePosition.y - offsetY * (newZoom - oldZoom) / oldZoom,
        });
      }
      
      setZoomIndex(newZoomIndex);
    }
  };

  const resetZoom = () => {
    setZoomIndex(DEFAULT_ZOOM_INDEX);
    setImagePosition({ x: 0, y: 0 });
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await modalRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Error entering fullscreen:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error('Error exiting fullscreen:', error);
      }
    }
  };

  const handleDownload = async () => {
    if (!currentImage) return;

    setIsDownloading(true);
    try {
      if (isSVGUrl(currentImage.imageUrl)) {
        const response = await fetch(currentImage.imageUrl);
        const svgContent = await response.text();
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `generated-vector-${currentImage.id}.svg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const response = await fetch(currentImage.imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `generated-image-${currentImage.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyUrl = () => {
    if (currentImage?.imageUrl) {
      navigator.clipboard.writeText(currentImage.imageUrl);
      toast.success('Image URL copied to clipboard!');
    }
  };

  const handleDelete = () => {
    if (!currentImage || !onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      onDelete(currentImage.id);
      toast.success('Image deleted successfully!');
    }
  };

  // Mouse drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (currentZoom > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ 
        x: e.clientX - imagePosition.x, 
        y: e.clientY - imagePosition.y 
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && currentZoom > 1) {
      e.preventDefault();
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Touch handling for mobile
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touch1: React.Touch, touch2: React.Touch) => ({
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && currentZoom > 1) {
      // Single touch - start dragging
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ 
        x: touch.clientX - imagePosition.x, 
        y: touch.clientY - imagePosition.y 
      });
    } else if (e.touches.length === 2) {
      // Two fingers - pinch zoom
      e.preventDefault();
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      const center = getTouchCenter(e.touches[0], e.touches[1]);
      setLastTouchDistance(distance);
      setInitialTouchCenter(center);
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && currentZoom > 1) {
      // Single touch drag
      e.preventDefault();
      const touch = e.touches[0];
      setImagePosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    } else if (e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault();
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      const center = getTouchCenter(e.touches[0], e.touches[1]);
      
      if (lastTouchDistance > 0) {
        const scale = distance / lastTouchDistance;
        
        if (scale > 1.1 && canZoomIn) {
          handleZoomIn(center.x, center.y);
          setLastTouchDistance(distance);
        } else if (scale < 0.9 && canZoomOut) {
          handleZoomOut(center.x, center.y);
          setLastTouchDistance(distance);
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      setLastTouchDistance(0);
    }
  };

  if (!isOpen || !currentImage) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={showMobileNavigationWithTimeout}
    >
      {/* Minimalist Navigation Areas - Exclude top area to avoid blocking controls */}
      {canGoPrevious && (
        <div 
          className="absolute left-0 top-20 bottom-20 w-32 z-10 group cursor-pointer flex items-center" 
          onClick={goToPrevious}
          onTouchStart={showMobileNavigationWithTimeout}
        >
          <div className={`ml-4 transition-all duration-300 transform ${
            showMobileNavigation || showInitialHint ? 'opacity-90 scale-110' : 'opacity-0 group-hover:opacity-100 group-hover:scale-110'
          }`}>
            <div className="bg-white/25 hover:bg-white/40 backdrop-blur-sm rounded-full p-3 shadow-xl border border-white/40 hover:border-white/60">
              <ArrowLeft className="h-5 w-5 text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
      )}

      {canGoNext && (
        <div 
          className="absolute right-0 top-20 bottom-20 w-32 z-10 group cursor-pointer flex items-center justify-end" 
          onClick={goToNext}
          onTouchStart={showMobileNavigationWithTimeout}
        >
          <div className={`mr-4 transition-all duration-300 transform ${
            showMobileNavigation || showInitialHint ? 'opacity-90 scale-110' : 'opacity-0 group-hover:opacity-100 group-hover:scale-110'
          }`}>
            <div className="bg-white/25 hover:bg-white/40 backdrop-blur-sm rounded-full p-3 shadow-xl border border-white/40 hover:border-white/60">
              <ArrowRight className="h-5 w-5 text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Mobile-First Close Button - Always Visible */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/30 bg-black/70 hover:bg-black/80 rounded-full h-12 w-12 p-0 backdrop-blur-md shadow-2xl border border-white/20 hover:border-white/40 transition-all duration-200"
          onClick={onClose}
        >
          <X className="h-6 w-6 drop-shadow-lg" />
        </Button>
      </div>

      {/* Top Controls - Desktop/Tablet */}
      <div className="absolute top-6 left-6 right-20 flex justify-between items-start z-30 hidden sm:flex">
        <div className="flex items-center gap-3 bg-black/60 rounded-full px-4 py-2 backdrop-blur-sm">
          <span className="text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </span>
          {currentImage.modelType && (
            <span className="text-white/80 text-xs px-3 py-1 bg-white/10 rounded-full">
              {currentImage.modelType}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-black/60 rounded-full px-3 py-2 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full"
              onClick={() => handleZoomOut()}
              disabled={!canZoomOut}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <span className="text-white text-sm min-w-[3.5rem] text-center font-medium">
              {Math.round(currentZoom * 100)}%
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full"
              onClick={() => handleZoomIn()}
              disabled={!canZoomIn}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full"
              onClick={resetZoom}
              disabled={currentZoom === 1 && imagePosition.x === 0 && imagePosition.y === 0}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1 bg-black/60 rounded-full px-3 py-2 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full"
              onClick={handleCopyUrl}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Controls - Simplified */}
      <div className={`absolute top-6 left-4 right-20 flex justify-between items-center z-30 sm:hidden transition-opacity duration-300 ${
        showMobileNavigation || showInitialHint ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="bg-black/70 rounded-full px-3 py-2 backdrop-blur-md">
          <span className="text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/30 bg-black/70 rounded-full h-10 w-10 p-0 backdrop-blur-md"
            onClick={handleCopyUrl}
            title="Copy image URL"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/30 bg-black/70 rounded-full h-10 w-10 p-0 backdrop-blur-md"
            onClick={handleDownload}
            disabled={isDownloading}
            title="Download image"
          >
            <Download className="h-4 w-4" />
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-red-500/30 bg-black/70 rounded-full h-10 w-10 p-0 backdrop-blur-md"
              onClick={handleDelete}
              title="Delete image"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Image Container */}
      <div 
        ref={imageContainerRef}
        className="relative max-w-[85vw] max-h-[85vh] overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          cursor: currentZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          touchAction: 'none'
        }}
      >
        <div
          className="transition-transform duration-200 ease-out select-none"
          style={{
            transform: `scale(${currentZoom}) translate(${imagePosition.x / currentZoom}px, ${imagePosition.y / currentZoom}px)`,
            transformOrigin: 'center center'
          }}
        >
          <UniversalImage
            src={currentImage.imageUrl}
            alt="Generated image"
            width={800}
            height={600}
            className="max-w-full max-h-[80vh] object-contain block"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              console.error('Failed to load image:', currentImage.imageUrl);
              toast.error('Failed to load image');
            }}
          />
        </div>
      </div>

      {/* Loading State */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-lg font-medium">Loading image...</div>
        </div>
      )}

      {/* Keyboard Shortcuts Help - Hidden on Mobile */}
      <div className="absolute bottom-6 right-6 text-white/60 text-xs bg-black/40 rounded-lg px-3 py-2 backdrop-blur-sm hidden sm:block">
        <div>ESC • ←/→ • Wheel/+/- • 0 Reset • F Fullscreen • Hover sides to navigate</div>
      </div>
      
      {/* Mobile Instructions */}
      <div className={`absolute bottom-4 left-4 right-4 text-white/70 text-xs bg-black/50 rounded-lg px-3 py-2 backdrop-blur-sm text-center sm:hidden transition-opacity duration-300 ${
        showInitialHint ? 'opacity-100' : 'opacity-0'
      }`}>
        <div>Tap image to show/hide controls • Pinch to zoom • Swipe left/right to navigate</div>
      </div>
    </div>
  );
}