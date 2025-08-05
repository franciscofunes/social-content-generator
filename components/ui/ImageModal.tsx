'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Share2, Facebook, Twitter, Linkedin, Instagram, Copy, Heart } from 'lucide-react';
import { downloadImage } from '@/lib/utils/download';
import { toast } from 'react-hot-toast';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  promptUsed?: string;
}

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];
const DEFAULT_ZOOM_INDEX = 2; // 100%

export function ImageModal({ isOpen, onClose, imageUrl, promptUsed }: ImageModalProps) {
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const currentZoom = ZOOM_LEVELS[zoomIndex];

  // Reset zoom and position when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoomIndex(DEFAULT_ZOOM_INDEX);
      setImageLoaded(false);
      setImagePosition({ x: 0, y: 0 });
      setIsDragging(false);
      setShowShareMenu(false);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Keyboard shortcuts and wheel zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleResetZoom();
          break;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (!isOpen || !e.ctrlKey) return;
      
      e.preventDefault();
      
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen, zoomIndex]);

  // Global mouse/touch event listeners for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && currentZoom > 1) {
        e.preventDefault();
        setImagePosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && currentZoom > 1 && e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        setImagePosition({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y
        });
      }
    };

    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
    };

    // Add global event listeners
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, currentZoom, dragStart, imagePosition]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showShareMenu]);

  const handleZoomIn = () => {
    if (zoomIndex < ZOOM_LEVELS.length - 1) {
      setZoomIndex(zoomIndex + 1);
    }
  };

  const handleZoomOut = () => {
    if (zoomIndex > 0) {
      setZoomIndex(zoomIndex - 1);
    }
  };

  const handleResetZoom = () => {
    setZoomIndex(DEFAULT_ZOOM_INDEX);
    setImagePosition({ x: 0, y: 0 });
  };

  // Mouse drag handlers
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

  // Touch drag handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (currentZoom > 1 && e.touches.length === 1) {
      e.preventDefault();
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({
        x: touch.clientX - imagePosition.x,
        y: touch.clientY - imagePosition.y
      });
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadImage(imageUrl, `bria-ai-generated-image-${Date.now()}`);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download image');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyImageUrl = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast.success('Image URL copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const handleShareToSocial = (platform: string) => {
    const shareText = promptUsed 
      ? `Check out this AI-generated image: "${promptUsed}"`
      : 'Check out this amazing AI-generated image!';
    
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(imageUrl);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we'll copy the image URL
        handleCopyImageUrl();
        toast.success('Image URL copied! Open Instagram and paste the link in your story or post.');
        return;
      default:
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
      setShowShareMenu(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Image',
          text: promptUsed || 'Check out this amazing AI-generated image!',
          url: imageUrl,
        });
        setShowShareMenu(false);
      } catch (error) {
        console.error('Native share failed:', error);
        // Fallback to copy URL
        handleCopyImageUrl();
      }
    } else {
      // Fallback for browsers that don't support native sharing
      handleCopyImageUrl();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full h-full flex flex-col">
        {/* Close Button - Fixed position top-right */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="fixed top-4 right-4 z-60 bg-black/80 hover:bg-black/90 text-white border-2 border-white/30 hover:border-white/50 rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-sm shadow-lg"
        >
          <X className="h-6 w-6 stroke-2" />
        </Button>

        {/* Header - Removed prompt display */}

        {/* Image Container */}
        <div 
          ref={imageContainerRef}
          className="flex-1 flex items-center justify-center p-4 overflow-hidden"
        >
          <div 
            ref={imageRef}
            className={`relative select-none ${
              isDragging ? '' : 'transition-transform duration-200 ease-out'
            } ${
              currentZoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
            }`}
            style={{ 
              transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${currentZoom})`,
              maxWidth: '90vw',
              maxHeight: '80vh',
              transformOrigin: 'center center'
            }}
            onDoubleClick={handleResetZoom}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <Image
              src={imageUrl}
              alt="Generated image preview"
              width={800}
              height={800}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
              onLoad={() => setImageLoaded(true)}
              priority
              draggable={false}
            />
            
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        </div>

        {/* Controls Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-black/50">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomIndex === 0}
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <span className="text-white text-sm font-medium min-w-[60px] text-center">
              {Math.round(currentZoom * 100)}%
            </span>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomIndex === ZOOM_LEVELS.length - 1}
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetZoom}
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Share Dropdown */}
            <div className="relative" ref={shareMenuRef}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/20"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              {showShareMenu && (
                <div className="absolute bottom-full mb-2 right-0 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-2 min-w-[200px] shadow-xl z-10">
                  <div className="flex flex-col gap-1">
                    {/* Native Share (Mobile) */}
                    <div className="block sm:hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNativeShare}
                        className="w-full justify-start text-white hover:bg-white/20"
                      >
                        <Share2 className="h-4 w-4 mr-3" />
                        Share...
                      </Button>
                    </div>
                    
                    {/* Social Media Options */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareToSocial('twitter')}
                      className="w-full justify-start text-white hover:bg-white/20"
                    >
                      <Twitter className="h-4 w-4 mr-3" />
                      Twitter/X
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareToSocial('facebook')}
                      className="w-full justify-start text-white hover:bg-white/20"
                    >
                      <Facebook className="h-4 w-4 mr-3" />
                      Facebook
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareToSocial('linkedin')}
                      className="w-full justify-start text-white hover:bg-white/20"
                    >
                      <Linkedin className="h-4 w-4 mr-3" />
                      LinkedIn
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareToSocial('instagram')}
                      className="w-full justify-start text-white hover:bg-white/20"
                    >
                      <Instagram className="h-4 w-4 mr-3" />
                      Instagram
                    </Button>
                    <hr className="border-white/20 my-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyImageUrl}
                      className="w-full justify-start text-white hover:bg-white/20"
                    >
                      <Copy className="h-4 w-4 mr-3" />
                      Copy URL
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Download Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="text-center pb-2">
          <p className="text-white/60 text-xs">
            <span className="hidden md:inline">Ctrl+Wheel to zoom • Drag to pan • Double-click to reset • </span>
            <span className="md:hidden">Drag to pan • Double-tap to reset • </span>
            ESC to close
          </p>
        </div>
      </div>
    </div>
  );
}