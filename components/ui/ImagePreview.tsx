'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download, Eye, RefreshCw } from 'lucide-react';
import { downloadImage } from '@/lib/utils/download';
import { toast } from 'react-hot-toast';
import { ImageModal } from './ImageModal';
// import { UploadButton, QuickUploadButton } from '@/components/cloudinary/UploadButton';

interface ImagePreviewProps {
  imageUrl: string;
  promptUsed?: string;
  className?: string;
}

export function ImagePreview({ imageUrl, promptUsed, className = '' }: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [cloudinaryData, setCloudinaryData] = useState<any>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadImage(imageUrl, `previnnova-generated-image-${Date.now()}`);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download image');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = () => {
    setIsModalOpen(true);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
  };

  // const handleUploadSuccess = (data: any) => {
  //   setCloudinaryData(data);
  //   toast.success('Image saved to your gallery!');
  // };

  // const handleUploadError = (error: any) => {
  //   console.error('Upload error:', error);
  // };

  return (
    <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
      {/* Image Container */}
      <div className="relative aspect-square w-full max-w-sm mx-auto mb-3 rounded-lg overflow-hidden bg-white">
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}
        
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-4">
            <p className="text-sm text-center mb-2">Failed to load image</p>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Try Again
            </Button>
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt="Generated image"
            fill
            className="object-cover"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}
      </div>

      {/* Prompt Used */}
      {promptUsed && (
        <div className="mb-3 p-2 bg-white rounded text-xs text-gray-600">
          <span className="font-medium">Prompt used:</span> {promptUsed}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreview}
          className="flex-1 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
          disabled={hasError}
          title="Open in full-screen modal with zoom controls"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleDownload}
          className="flex-1"
          disabled={hasError || isDownloading}
        >
          <Download className="h-4 w-4 mr-2" />
          {isDownloading ? 'Downloading...' : 'Download'}
        </Button>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={imageUrl}
        promptUsed={promptUsed}
      />
    </div>
  );
}