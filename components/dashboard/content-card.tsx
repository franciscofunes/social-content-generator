'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Copy, Download, Check, ExternalLink, Eye } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { downloadImage } from '@/lib/utils/download';
import { toast } from 'react-hot-toast';
import { Post } from '@/lib/types/content';

interface ContentCardProps {
  post: Post;
  platform: 'instagram' | 'linkedin';
  postNumber: number;
}

export function ContentCard({ post, platform, postNumber }: ContentCardProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [useRegularImg, setUseRegularImg] = useState(false);
  
  const content = post[`${platform}Content`];
  
  // Debug logging
  console.log(`ContentCard - Post ${postNumber} (${platform}):`, {
    postId: post.id,
    imageUrl: content?.imageUrl,
    content: content ? 'exists' : 'missing',
    fullPost: post,
    fullContent: content
  });
  
  const handleCopyText = async () => {
    try {
      await copyToClipboard(content.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Text copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy text');
    }
  };
  
  const handleDownloadImage = async () => {
    try {
      console.log('Downloading image:', content.imageUrl);
      await downloadImage(content.imageUrl, `previnnova-${platform}-${post.category}-${postNumber}`);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
      toast.success(`Image downloaded! (${platform})`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePreviewImage = () => {
    window.open(content.imageUrl, '_blank');
  };

  const handleMarkAsPosted = async () => {
    try {
      const response = await fetch('/api/content/mark-posted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          postId: post.id, 
          platform,
          date: new Date().toISOString().split('T')[0]
        })
      });
      
      if (response.ok) {
        toast.success(`Marked as posted on ${platform}!`);
      }
    } catch (error) {
      toast.error('Failed to mark as posted');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Post {postNumber}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {post.category}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyText}
            className="h-8 w-8 p-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Image */}
        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
          <div className="absolute top-2 left-2 z-10 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {content?.imageUrl ? 'URL OK' : 'NO URL'}
          </div>
          
          {!content?.imageUrl ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-100 text-red-700">
              <p className="text-sm font-medium">No Image URL Found</p>
              <p className="text-xs mt-1">Check console for debugging info</p>
            </div>
          ) : imageLoading && !imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="ml-2 text-sm">Loading image...</p>
            </div>
          ) : imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-600 p-4">
              <p className="text-sm font-medium">Failed to load image</p>
              <p className="text-xs mt-1 break-all text-center">{content.imageUrl}</p>
              <button 
                onClick={() => {
                  console.log('Retrying image load for:', content.imageUrl);
                  setImageError(false);
                  setImageLoading(true);
                }}
                className="text-xs text-blue-500 mt-2 underline hover:text-blue-700"
              >
                Retry Load
              </button>
            </div>
          ) : useRegularImg ? (
            <img
              src={content.imageUrl}
              alt={`Workplace safety content for ${post.category}`}
              className="w-full h-full object-cover"
              onLoad={() => {
                console.log('Regular img loaded successfully:', content.imageUrl);
                setImageLoading(false);
              }}
              onError={(e) => {
                console.error('Regular img load error:', e, 'URL:', content.imageUrl);
                setImageLoading(false);
                setImageError(true);
              }}
            />
          ) : (
            <Image
              src={content.imageUrl}
              alt={`Workplace safety content for ${post.category}`}
              fill
              className="object-cover"
              onLoad={() => {
                console.log('Next.js Image loaded successfully:', content.imageUrl);
                setImageLoading(false);
              }}
              onError={(e) => {
                console.error('Next.js Image load error, trying regular img:', e, 'URL:', content.imageUrl);
                setUseRegularImg(true);
                setImageLoading(true);
                setImageError(false);
              }}
            />
          )}
        </div>
        
        {/* Text content preview */}
        <div className="space-y-2">
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {showFullText ? content.text : content.text.slice(0, 150) + (content.text.length > 150 ? '...' : '')}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setShowFullText(!showFullText)}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            {showFullText ? 'Show Less' : 'View Full Text'}
          </Button>
        </div>
        
        {/* Hashtags */}
        <div className="flex flex-wrap gap-1">
          {content.hashtags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {content.hashtags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{content.hashtags.length - 3} more
            </Badge>
          )}
        </div>
        
        {/* Image Actions */}
        <div className="flex gap-2 mb-2">
          <Button
            onClick={handlePreviewImage}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Image
          </Button>
          <Button
            onClick={handleDownloadImage}
            variant="default"
            size="sm"
            className="flex-1"
            disabled={downloaded || imageError}
          >
            <Download className="h-4 w-4 mr-2" />
            {downloaded ? 'Downloaded!' : 'Download'}
          </Button>
        </div>

        {/* Content Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleMarkAsPosted}
            className="flex-1"
            disabled={post.isPosted[platform]}
          >
            {post.isPosted[platform] ? '✓ Posted' : 'Mark as Posted'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}