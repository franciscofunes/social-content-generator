'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Twitter, 
  Facebook, 
  Linkedin, 
  Instagram, 
  Video, 
  MessageCircle, 
  Send, 
  Copy,
  Share2,
  Check,
  AlertCircle
} from 'lucide-react';
import { 
  shareToSocialPlatform, 
  copyToClipboard, 
  nativeShare,
  isNativeShareSupported,
  SOCIAL_PLATFORMS,
  trackShare
} from '@/lib/utils/social-sharing';
import { toast } from 'react-hot-toast';

interface ShareButtonGroupProps {
  text: string;
  hashtags?: string[];
  url?: string;
  platforms: string[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  showCopyButton?: boolean;
  showNativeShare?: boolean;
  className?: string;
}

const PLATFORM_ICONS = {
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  instagram: Instagram,
  tiktok: Video,
  whatsapp: MessageCircle,
  telegram: Send,
};

const ShareButtonGroup: React.FC<ShareButtonGroupProps> = ({
  text,
  hashtags = [],
  url,
  platforms,
  layout = 'horizontal',
  size = 'md',
  showLabels = true,
  showCopyButton = true,
  showNativeShare = false,
  className = ''
}) => {
  const [isSharing, setIsSharing] = useState<{ [platform: string]: boolean }>({});
  const [shareStatus, setShareStatus] = useState<{ [platform: string]: 'success' | 'error' | null }>({});

  const handleShare = async (platform: string) => {
    setIsSharing(prev => ({ ...prev, [platform]: true }));
    setShareStatus(prev => ({ ...prev, [platform]: null }));

    try {
      const result = await shareToSocialPlatform(platform, {
        text,
        hashtags,
        url
      });

      if (result.success) {
        setShareStatus(prev => ({ ...prev, [platform]: 'success' }));
        toast.success(result.message);
        trackShare(platform);
        
        // Clear success status after 3 seconds
        setTimeout(() => {
          setShareStatus(prev => ({ ...prev, [platform]: null }));
        }, 3000);
      } else {
        setShareStatus(prev => ({ ...prev, [platform]: 'error' }));
        toast.error(result.message);
        
        // Clear error status after 5 seconds
        setTimeout(() => {
          setShareStatus(prev => ({ ...prev, [platform]: null }));
        }, 5000);
      }
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
      setShareStatus(prev => ({ ...prev, [platform]: 'error' }));
      toast.error(`Failed to share to ${SOCIAL_PLATFORMS[platform]?.name || platform}`);
      
      setTimeout(() => {
        setShareStatus(prev => ({ ...prev, [platform]: null }));
      }, 5000);
    } finally {
      setIsSharing(prev => ({ ...prev, [platform]: false }));
    }
  };

  const handleCopy = async () => {
    try {
      const result = await copyToClipboard(text, hashtags);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const handleNativeShare = async () => {
    try {
      const result = await nativeShare({
        text,
        hashtags,
        url
      });
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to share content');
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'h-8 px-3 text-sm';
      case 'lg': return 'h-12 px-6 text-base';
      default: return 'h-10 px-4';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-3 w-3';
      case 'lg': return 'h-5 w-5';
      default: return 'h-4 w-4';
    }
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'flex flex-col gap-2';
      case 'grid':
        return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2';
      default:
        return 'flex flex-wrap gap-2';
    }
  };

  const renderShareButton = (platform: string) => {
    const Icon = PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS];
    const config = SOCIAL_PLATFORMS[platform];
    const isLoading = isSharing[platform];
    const status = shareStatus[platform];
    
    if (!Icon || !config) return null;

    return (
      <Button
        key={platform}
        variant="outline"
        onClick={() => handleShare(platform)}
        disabled={isLoading}
        className={`
          ${getButtonSize()}
          ${config.color.replace('bg-', 'border-').replace('hover:', 'hover:border-')}
          text-white border-2 transition-all duration-200
          ${status === 'success' ? 'border-green-500 bg-green-500' : ''}
          ${status === 'error' ? 'border-red-500 bg-red-500' : ''}
          ${!status ? config.color : ''}
          relative overflow-hidden
        `}
      >
        <div className="flex items-center gap-2">
          {status === 'success' ? (
            <Check className={getIconSize()} />
          ) : status === 'error' ? (
            <AlertCircle className={getIconSize()} />
          ) : isLoading ? (
            <div className={`${getIconSize()} animate-spin rounded-full border-2 border-white border-t-transparent`} />
          ) : (
            <Icon className={getIconSize()} />
          )}
          
          {showLabels && (
            <span className="font-medium">
              {status === 'success' ? 'Shared!' :
               status === 'error' ? 'Failed' :
               isLoading ? 'Sharing...' :
               config.name}
            </span>
          )}
        </div>
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 animate-pulse" />
        )}
      </Button>
    );
  };

  return (
    <div className={`${getLayoutClasses()} ${className}`}>
      {/* Native share button (mobile/PWA) */}
      {showNativeShare && isNativeShareSupported() && (
        <Button
          variant="outline"
          onClick={handleNativeShare}
          className={`
            ${getButtonSize()}
            bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700
            text-white border-0
          `}
        >
          <Share2 className={`${getIconSize()} mr-2`} />
          {showLabels && 'Share'}
        </Button>
      )}

      {/* Platform-specific share buttons */}
      {platforms.map(platform => renderShareButton(platform))}

      {/* Copy to clipboard button */}
      {showCopyButton && (
        <Button
          variant="outline"
          onClick={handleCopy}
          className={`
            ${getButtonSize()}
            border-gray-300 dark:border-gray-600 
            hover:bg-gray-100 dark:hover:bg-gray-700
            text-gray-700 dark:text-gray-200
          `}
        >
          <Copy className={`${getIconSize()} ${showLabels ? 'mr-2' : ''}`} />
          {showLabels && 'Copy'}
        </Button>
      )}
    </div>
  );
};

export default ShareButtonGroup;