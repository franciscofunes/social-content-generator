// Social media sharing utilities

export interface ShareOptions {
  text: string;
  url?: string;
  hashtags?: string[];
  via?: string;
}

export interface PlatformShareConfig {
  name: string;
  icon: string;
  color: string;
  shareUrl: (options: ShareOptions) => string;
  supportsNativeShare: boolean;
  maxTextLength?: number;
  instructions?: string;
}

// Platform-specific sharing configurations
export const SOCIAL_PLATFORMS: { [key: string]: PlatformShareConfig } = {
  twitter: {
    name: 'Twitter/X',
    icon: 'Twitter',
    color: 'bg-blue-400 hover:bg-blue-500',
    supportsNativeShare: true,
    maxTextLength: 280,
    shareUrl: (options) => {
      const text = options.hashtags 
        ? `${options.text} ${options.hashtags.join(' ')}`
        : options.text;
      
      const params = new URLSearchParams({
        text: text.substring(0, 280),
        ...(options.url && { url: options.url }),
        ...(options.via && { via: options.via })
      });
      
      return `https://twitter.com/intent/tweet?${params.toString()}`;
    }
  },
  
  facebook: {
    name: 'Facebook',
    icon: 'Facebook',
    color: 'bg-blue-600 hover:bg-blue-700',
    supportsNativeShare: true,
    shareUrl: (options) => {
      const params = new URLSearchParams({
        quote: options.text,
        ...(options.url && { u: options.url })
      });
      
      return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
    }
  },
  
  linkedin: {
    name: 'LinkedIn',
    icon: 'Linkedin',
    color: 'bg-blue-700 hover:bg-blue-800',
    supportsNativeShare: true,
    shareUrl: (options) => {
      const params = new URLSearchParams({
        summary: options.text,
        ...(options.url && { url: options.url })
      });
      
      return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
    }
  },
  
  instagram: {
    name: 'Instagram',
    icon: 'Instagram',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    supportsNativeShare: false,
    instructions: 'Copy the text and paste it into your Instagram post or story.',
    shareUrl: () => '' // Instagram doesn't support direct URL sharing
  },
  
  tiktok: {
    name: 'TikTok',
    icon: 'Video',
    color: 'bg-black hover:bg-gray-800',
    supportsNativeShare: false,
    instructions: 'Copy the text and hashtags to use in your TikTok video description.',
    shareUrl: () => '' // TikTok doesn't support direct URL sharing
  },
  
  whatsapp: {
    name: 'WhatsApp',
    icon: 'MessageCircle',
    color: 'bg-green-500 hover:bg-green-600',
    supportsNativeShare: true,
    shareUrl: (options) => {
      const text = options.hashtags 
        ? `${options.text}\n\n${options.hashtags.join(' ')}`
        : options.text;
      
      const params = new URLSearchParams({
        text: options.url ? `${text}\n\n${options.url}` : text
      });
      
      return `https://wa.me/?${params.toString()}`;
    }
  },
  
  telegram: {
    name: 'Telegram',
    icon: 'Send',
    color: 'bg-blue-500 hover:bg-blue-600',
    supportsNativeShare: true,
    shareUrl: (options) => {
      const text = options.hashtags 
        ? `${options.text}\n\n${options.hashtags.join(' ')}`
        : options.text;
      
      const params = new URLSearchParams({
        text: options.url ? `${text}\n\n${options.url}` : text
      });
      
      return `https://t.me/share/url?${params.toString()}`;
    }
  }
};

// Share to specific platform
export const shareToSocialPlatform = async (
  platform: string, 
  options: ShareOptions
): Promise<{ success: boolean; message: string }> => {
  const config = SOCIAL_PLATFORMS[platform];
  
  if (!config) {
    return { 
      success: false, 
      message: 'Platform not supported' 
    };
  }

  try {
    // For platforms that don't support URL sharing (Instagram, TikTok)
    if (!config.supportsNativeShare) {
      const textToCopy = options.hashtags 
        ? `${options.text}\n\n${options.hashtags.join(' ')}`
        : options.text;
      
      await navigator.clipboard.writeText(textToCopy);
      
      return {
        success: true,
        message: config.instructions || `Content copied to clipboard for ${config.name}!`
      };
    }

    // For platforms that support URL sharing
    const shareUrl = config.shareUrl(options);
    
    // Try native Web Share API first (mobile/PWA)
    if (navigator.share && isMobileDevice()) {
      try {
        await navigator.share({
          title: `Sharing to ${config.name}`,
          text: options.text,
          url: options.url
        });
        
        return {
          success: true,
          message: `Shared to ${config.name} successfully!`
        };
      } catch (error) {
        // Fall through to URL method if native share fails/cancelled
      }
    }

    // Fallback to opening share URL in new window
    if (shareUrl) {
      const popup = window.open(
        shareUrl,
        `share-${platform}`,
        'width=600,height=400,scrollbars=yes,resizable=yes,left=' + 
        (screen.width / 2 - 300) + ',top=' + (screen.height / 2 - 200)
      );

      if (popup) {
        return {
          success: true,
          message: `Opening ${config.name} share dialog...`
        };
      } else {
        // Popup blocked, copy URL instead
        await navigator.clipboard.writeText(shareUrl);
        return {
          success: true,
          message: `Share URL copied to clipboard! Paste it in your browser to share to ${config.name}.`
        };
      }
    }

    return {
      success: false,
      message: 'Unable to share to this platform'
    };
    
  } catch (error) {
    console.error(`Error sharing to ${platform}:`, error);
    
    // Final fallback: copy text to clipboard
    try {
      const fallbackText = options.hashtags 
        ? `${options.text}\n\n${options.hashtags.join(' ')}`
        : options.text;
      
      await navigator.clipboard.writeText(fallbackText);
      
      return {
        success: true,
        message: `Content copied to clipboard! You can paste it in ${config.name}.`
      };
    } catch (clipboardError) {
      return {
        success: false,
        message: `Failed to share to ${config.name}. Please try again.`
      };
    }
  }
};

// Copy content to clipboard with formatting
export const copyToClipboard = async (
  text: string, 
  hashtags?: string[]
): Promise<{ success: boolean; message: string }> => {
  try {
    const contentToCopy = hashtags 
      ? `${text}\n\n${hashtags.join(' ')}`
      : text;
    
    await navigator.clipboard.writeText(contentToCopy);
    
    return {
      success: true,
      message: 'Content copied to clipboard!'
    };
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = hashtags ? `${text}\n\n${hashtags.join(' ')}` : text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return {
        success: true,
        message: 'Content copied to clipboard!'
      };
    } catch (fallbackError) {
      return {
        success: false,
        message: 'Failed to copy content. Please select and copy manually.'
      };
    }
  }
};

// Native share (for mobile devices and PWAs)
export const nativeShare = async (
  options: ShareOptions
): Promise<{ success: boolean; message: string }> => {
  if (!navigator.share) {
    return {
      success: false,
      message: 'Native sharing not supported on this device'
    };
  }

  try {
    await navigator.share({
      title: 'Social Media Content',
      text: options.text,
      url: options.url
    });
    
    return {
      success: true,
      message: 'Content shared successfully!'
    };
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return {
        success: false,
        message: 'Share cancelled'
      };
    }
    
    return {
      success: false,
      message: 'Failed to share content'
    };
  }
};

// Utility functions
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isNativeShareSupported = (): boolean => {
  return 'share' in navigator && isMobileDevice();
};

export const getPlatformIcon = (platform: string): string => {
  return SOCIAL_PLATFORMS[platform]?.icon || 'Share2';
};

export const getPlatformColor = (platform: string): string => {
  return SOCIAL_PLATFORMS[platform]?.color || 'bg-gray-500 hover:bg-gray-600';
};

// Format text for specific platform constraints
export const formatTextForPlatform = (
  text: string, 
  platform: string, 
  hashtags?: string[]
): string => {
  const config = SOCIAL_PLATFORMS[platform];
  if (!config || !config.maxTextLength) {
    return hashtags ? `${text}\n\n${hashtags.join(' ')}` : text;
  }

  const hashtagText = hashtags ? `\n\n${hashtags.join(' ')}` : '';
  const maxContentLength = config.maxTextLength - hashtagText.length;
  
  if (text.length <= maxContentLength) {
    return text + hashtagText;
  }
  
  // Truncate text to fit within platform limits
  const truncatedText = text.substring(0, maxContentLength - 3) + '...';
  return truncatedText + hashtagText;
};

// Get sharing analytics data
export const getShareAnalytics = () => {
  const shareData = localStorage.getItem('social-share-analytics');
  return shareData ? JSON.parse(shareData) : {};
};

// Track sharing analytics
export const trackShare = (platform: string) => {
  const analytics = getShareAnalytics();
  const today = new Date().toISOString().split('T')[0];
  
  if (!analytics[today]) {
    analytics[today] = {};
  }
  
  analytics[today][platform] = (analytics[today][platform] || 0) + 1;
  
  // Keep only last 30 days of data
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  Object.keys(analytics).forEach(date => {
    if (new Date(date) < thirtyDaysAgo) {
      delete analytics[date];
    }
  });
  
  localStorage.setItem('social-share-analytics', JSON.stringify(analytics));
};