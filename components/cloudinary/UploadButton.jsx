'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function UploadButton({ 
  imageUrl, 
  prompt, 
  generationType = 'generated',
  onUploadSuccess,
  onUploadError,
  className = '',
  size = 'default'
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  const handleUpload = async () => {
    if (!imageUrl) {
      toast.error('No image to upload');
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          prompt,
          generationType,
          tags: ['previnnova', generationType, 'generated'],
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsUploaded(true);
        toast.success('Image uploaded to Cloudinary!');
        onUploadSuccess?.(result.data);
        
        // Reset uploaded state after 3 seconds
        setTimeout(() => setIsUploaded(false), 3000);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
      onUploadError?.(error);
    } finally {
      setIsUploading(false);
    }
  };

  const getButtonContent = () => {
    if (isUploading) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Uploading...
        </>
      );
    }

    if (isUploaded) {
      return (
        <>
          <Check className="h-4 w-4 mr-2 text-green-600" />
          Uploaded!
        </>
      );
    }

    return (
      <>
        <Upload className="h-4 w-4 mr-2" />
        Upload to Cloud
      </>
    );
  };

  return (
    <Button
      onClick={handleUpload}
      disabled={isUploading || !imageUrl}
      variant={isUploaded ? "secondary" : "default"}
      size={size}
      className={`
        transition-all duration-200 touch-manipulation
        ${isUploaded ? 'bg-green-50 border-green-200 text-green-700' : ''}
        ${className}
      `}
    >
      {getButtonContent()}
    </Button>
  );
}

export function QuickUploadButton({ 
  imageUrl, 
  prompt, 
  generationType = 'generated',
  onUploadSuccess,
  className = ''
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleQuickUpload = async () => {
    if (!imageUrl) return;

    setIsUploading(true);

    try {
      const response = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          prompt,
          generationType,
          tags: ['previnnova', generationType],
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Uploaded to cloud!', {
          duration: 2000,
          position: 'bottom-center',
        });
        onUploadSuccess?.(result.data);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Quick upload error:', error);
      toast.error('Upload failed', {
        duration: 2000,
        position: 'bottom-center',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Button
      onClick={handleQuickUpload}
      disabled={isUploading || !imageUrl}
      variant="ghost"
      size="sm"
      className={`h-8 w-8 p-0 hover:bg-blue-50 ${className}`}
      title="Quick upload to Cloudinary"
    >
      {isUploading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Upload className="h-4 w-4" />
      )}
    </Button>
  );
}