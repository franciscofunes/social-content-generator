"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Wand2, 
  Image as ImageIcon, 
  Palette, 
  Settings, 
  Download,
  Heart,
  Copy,
  Sparkles,
  Camera,
  Brush,
  Zap,
  ChevronDown,
  RefreshCw,
  Maximize2,
  Eye,
  ZoomIn
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  saveImageToFirestore, 
  loadImagesFromFirestore, 
  deleteImageFromFirestore,
  SavedImage 
} from '@/lib/firestore-client';
import { ImprovedImageModal } from '@/components/ui/ImprovedImageModal';
import { UniversalImage } from '@/components/ui/UniversalImage';

const modelTypes = [
  { id: 'base', name: 'Base (v3.2)', description: 'High-quality, balanced generation', version: '3.2' },
  { id: 'fast', name: 'Fast (v2.3)', description: 'Quick turnaround', version: '2.3' },
  { id: 'hd', name: 'HD (v2.2)', description: 'Maximum detail 1920×1080', version: '2.2' },
  { id: 'vector', name: 'Vector (v3.2)', description: 'Scalable SVG graphics', version: '3.2' }
];

const mediumTypes = [
  { id: 'photography', name: 'Photography', description: 'Photorealistic images' },
  { id: 'art', name: 'Digital Art', description: 'Artistic and creative style' }
];

const qualitySettings = [
  { id: 'speed', name: 'Speed', steps: 8, guidance: 3, description: 'Fastest generation' },
  { id: 'balanced', name: 'Balanced', steps: 20, guidance: 5, description: 'Good quality & speed' },
  { id: 'quality', name: 'Quality', steps: 30, guidance: 7, description: 'High quality results' },
  { id: 'premium', name: 'Premium', steps: 40, guidance: 8, description: 'Maximum quality' }
];

const colorPalettes = [
  { name: 'Vibrant', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'] },
  { name: 'Monochrome', colors: ['#2C3E50', '#34495E', '#7F8C8D', '#BDC3C7', '#ECF0F1'] },
  { name: 'Warm', colors: ['#E74C3C', '#E67E22', '#F39C12', '#F1C40F', '#D35400'] },
  { name: 'Cool', colors: ['#3498DB', '#2980B9', '#1ABC9C', '#16A085', '#27AE60'] },
  { name: 'Pastel', colors: ['#F8BBD9', '#E4F7F7', '#FFF2CC', '#E1F7D5', '#FFBDBD'] }
];

export default function ImageCreator() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState('');
  const [modelType, setModelType] = useState('base');
  const [medium, setMedium] = useState('photography');
  const [qualitySetting, setQualitySetting] = useState('balanced');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [numResults, setNumResults] = useState(1);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [promptEnhancement, setPromptEnhancement] = useState(true);
  const [enhanceImage, setEnhanceImage] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [currentImageSeed, setCurrentImageSeed] = useState<number | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string>('');
  const [modalPrompt, setModalPrompt] = useState<string>('');

  // Load prompt from URL parameters on mount
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    if (promptParam) {
      setPrompt(decodeURIComponent(promptParam));
      toast.success('Prompt loaded from Prompt Generator!');
    }
  }, [searchParams]);

  // Load saved images when user is authenticated
  useEffect(() => {
    if (user) {
      loadSavedImages();
    } else {
      setSavedImages([]);
    }
  }, [user]);

  const loadSavedImages = async () => {
    if (!user) return;

    setLoadingImages(true);
    try {
      console.log('Loading images for user:', user.uid);
      const images = await loadImagesFromFirestore(user.uid);
      console.log('Loaded images:', images.length);
      setSavedImages(images);
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Failed to load saved images');
    } finally {
      setLoadingImages(false);
    }
  };

  const promptTemplates = [
    "A professional headshot of a businessperson in modern office setting",
    "Beautiful landscape with mountains and lake at golden hour",
    "Minimalist product photography on clean white background",
    "Cozy coffee shop interior with warm lighting and comfortable seating",
    "Abstract geometric art with bold colors and dynamic shapes"
  ];

  const getSelectedQuality = () => {
    return qualitySettings.find(q => q.id === qualitySetting) || qualitySettings[1];
  };

  const getSelectedModel = () => {
    return modelTypes.find(m => m.id === modelType) || modelTypes[0];
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    
    try {
      const quality = getSelectedQuality();
      const model = getSelectedModel();
      
      const requestBody = {
        prompt: prompt.trim(),
        model_type: modelType,
        model_version: model.version,
        num_results: numResults,
        aspect_ratio: aspectRatio,
        sync: true,
        medium,
        steps_num: quality.steps,
        text_guidance_scale: quality.guidance,
        prompt_enhancement: promptEnhancement,
        enhance_image: enhanceImage,
        prompt_content_moderation: false, // Disabled per request
        content_moderation: false, // Disabled per request
        ip_signal: false, // Disabled per request
        ...(negativePrompt.trim() && { negative_prompt: negativePrompt.trim() }),
        ...(seed !== undefined && { seed })
      };

      console.log('Generating image with Bria AI:', requestBody);
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.result && data.result[0] && data.result[0].urls && data.result[0].urls[0]) {
        const imageUrl = data.result[0].urls[0];
        console.log('Bria AI image URL:', imageUrl);
        
        // Reset error state and set the new image
        setImageLoadError(false);
        setGeneratedImage(imageUrl);
        toast.success('Image generated successfully with Bria AI!');
        
        // Log the seed for reproduction
        if (data.result[0].seed) {
          console.log('Generated with seed:', data.result[0].seed);
          setCurrentImageSeed(data.result[0].seed);
          setSeed(data.result[0].seed);
        }
      } else {
        throw new Error('Invalid response format');
      }
      
      // Update user stats if signed in
      if (user) {
        // TODO: Update user stats in Firebase
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied to clipboard!');
  };

  const generateRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  const clearSeed = () => {
    setSeed(undefined);
  };

  const handleImageLoad = () => {
    setImageLoadError(false);
    console.log('Image loaded successfully');
  };

  const handleImageError = async (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image failed to load:', generatedImage);
    
    // Try using the proxy as a fallback
    if (generatedImage && !generatedImage.includes('/api/image-proxy')) {
      console.log('Attempting to load image through proxy...');
      const proxiedUrl = `/api/image-proxy?url=${encodeURIComponent(generatedImage)}`;
      const img = event.target as HTMLImageElement;
      img.src = proxiedUrl;
      return;
    }
    
    // If proxy also fails, show error state
    setImageLoadError(true);
    toast.error('Failed to load generated image. The image was created but may have loading restrictions.');
  };

  const copyImageUrl = () => {
    if (generatedImage) {
      navigator.clipboard.writeText(generatedImage);
      toast.success('Image URL copied to clipboard!');
    }
  };

  const downloadImage = async () => {
    if (generatedImage) {
      try {
        // First try the direct URL
        let downloadUrl = generatedImage;
        
        // If we have loading errors, use the proxy
        if (imageLoadError) {
          downloadUrl = `/api/image-proxy?url=${encodeURIComponent(generatedImage)}`;
        }
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `bria-ai-image-${Date.now()}.png`;
        link.target = '_blank'; // Open in new tab as backup
        link.click();
        toast.success('Image download started!');
      } catch (error) {
        console.error('Download failed:', error);
        toast.error('Download failed. You can try copying the URL and downloading manually.');
      }
    }
  };

  const saveImage = async () => {
    if (!user) {
      toast.error('Please sign in to save images');
      return;
    }

    if (!generatedImage || !prompt.trim()) {
      toast.error('No image to save');
      return;
    }

    // Check if image already exists
    const existingImage = savedImages.find(img => img.imageUrl === generatedImage);
    if (existingImage) {
      toast.error('Image already saved');
      return;
    }

    try {
      console.log('Saving image for user:', user.uid);
      
      const quality = getSelectedQuality();
      const model = getSelectedModel();
      
      // Build settings object without undefined values
      const settings: any = {
        medium: medium,
        qualitySetting: qualitySetting,
        steps: quality.steps,
        guidance: quality.guidance,
        promptEnhancement: promptEnhancement,
        enhanceImage: enhanceImage
      };

      // Only add negativePrompt if it has content
      if (negativePrompt.trim()) {
        settings.negativePrompt = negativePrompt.trim();
      }

      const imageData: any = {
        imageUrl: generatedImage,
        prompt: prompt.trim(),
        userId: user.uid,
        modelType: modelType,
        modelVersion: model.version,
        aspectRatio: aspectRatio,
        settings: settings
      };

      // Only add seed if it exists
      if (currentImageSeed !== undefined) {
        imageData.seed = currentImageSeed;
      }

      const savedImage = await saveImageToFirestore(imageData);
      console.log('Image saved:', savedImage.id);
      
      // Add to local state
      setSavedImages(prev => [savedImage, ...prev]);
      toast.success('Image saved successfully!');
      
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save image');
    }
  };

  const removeImage = async (imageId: string) => {
    if (!user) {
      toast.error('Please sign in to delete images');
      return;
    }

    try {
      console.log('Deleting image:', imageId);
      
      await deleteImageFromFirestore(imageId, user.uid);
      console.log('Image deleted:', imageId);

      // Remove from local state
      setSavedImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Image removed successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete image');
    }
  };

  const useTemplate = (template: string) => {
    setPrompt(template);
  };

  const openImageModal = (imageUrl: string, promptText: string) => {
    setModalImageUrl(imageUrl);
    setModalPrompt(promptText);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setModalImageUrl('');
    setModalPrompt('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <ImageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Image Creator</h1>
              <p className="text-gray-600 dark:text-gray-400">Generate stunning images with advanced AI</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Prompt Input */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Prompt</h3>
                <Button variant="ghost" size="sm" onClick={copyPrompt}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create..."
                className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {prompt.length} characters
                </span>
                <Button
                  onClick={generateImage}
                  disabled={isGenerating || !prompt.trim()}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Templates */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Templates</h3>
              <div className="space-y-3">
                {promptTemplates.map((template, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full text-left justify-start h-auto p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 min-h-[3rem]"
                    onClick={() => useTemplate(template)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm leading-relaxed break-words text-left whitespace-normal overflow-hidden">
                        {template}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Model Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bria AI Model</h3>
              <div className="grid grid-cols-1 gap-3">
                {modelTypes.map((model) => (
                  <Button
                    key={model.id}
                    variant={modelType === model.id ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => setModelType(model.id)}
                  >
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs opacity-70 mt-1">{model.description}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Quality & Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quality & Performance</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quality Setting</label>
                  <div className="grid grid-cols-2 gap-2">
                    {qualitySettings.map((quality) => (
                      <Button
                        key={quality.id}
                        variant={qualitySetting === quality.id ? "default" : "outline"}
                        className="h-auto p-3 flex flex-col items-center"
                        onClick={() => setQualitySetting(quality.id)}
                      >
                        <span className="font-medium text-sm">{quality.name}</span>
                        <span className="text-xs opacity-70 mt-1">{quality.description}</span>
                        <span className="text-xs text-blue-600 dark:text-blue-400 mt-1">Steps: {quality.steps} | Guidance: {quality.guidance}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Medium Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {mediumTypes.map((med) => (
                      <Button
                        key={med.id}
                        variant={medium === med.id ? "default" : "outline"}
                        className="h-auto p-3 flex flex-col items-start"
                        onClick={() => setMedium(med.id)}
                      >
                        <span className="font-medium">{med.name}</span>
                        <span className="text-xs opacity-70 mt-1">{med.description}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-0 mb-4"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Settings</h3>
                <ChevronDown className={`h-5 w-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </Button>
              
              {showAdvanced && (
                <div className="space-y-6">
                  {/* Negative Prompt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Negative Prompt (Optional)</label>
                    <textarea
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="Elements to exclude from the image..."
                      className="w-full h-20 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>

                  {/* Number of Results */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Images</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((num) => (
                        <Button
                          key={num}
                          variant={numResults === num ? "default" : "outline"}
                          onClick={() => setNumResults(num)}
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Seed Control */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seed (Optional)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={seed || ''}
                        onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Random seed..."
                        className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <Button variant="outline" onClick={generateRandomSeed}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" onClick={clearSeed}>
                        Clear
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Use the same seed to reproduce results</p>
                  </div>

                  {/* AI Enhancement Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">AI Enhancement Options</label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">Prompt Enhancement</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Let Bria AI enhance your prompt for better results</p>
                        </div>
                        <Button
                          variant={promptEnhancement ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPromptEnhancement(!promptEnhancement)}
                        >
                          {promptEnhancement ? 'ON' : 'OFF'}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">Image Enhancement</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Generate images with richer details and textures</p>
                        </div>
                        <Button
                          variant={enhanceImage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setEnhanceImage(!enhanceImage)}
                        >
                          {enhanceImage ? 'ON' : 'OFF'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Aspect Ratio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aspect Ratio</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'].map((ratio) => (
                        <Button
                          key={ratio}
                          variant={aspectRatio === ratio ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAspectRatio(ratio)}
                        >
                          {ratio}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Content & Safety */}
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">⚠️ Content Restrictions Disabled</h4>
                    <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                      <li>• Prompt content moderation: OFF</li>
                      <li>• Output content moderation: OFF</li>
                      <li>• IP signal detection: OFF</li>
                    </ul>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-2">All safety restrictions have been disabled as requested</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Generated Image */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generated Image</h3>
              
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden relative group">
                {generatedImage ? (
                  imageLoadError ? (
                    <div className="text-center p-6">
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Camera className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          <span className="font-medium text-yellow-800 dark:text-yellow-200">Image Generated but Preview Failed</span>
                        </div>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                          The image was successfully created by Bria AI but cannot be displayed due to CORS restrictions.
                        </p>
                        <div className="flex flex-col gap-2">
                          <Button onClick={copyImageUrl} size="sm" variant="outline">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Image URL
                          </Button>
                          <Button onClick={downloadImage} size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download Image
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Original URL: {generatedImage.substring(0, 50)}...
                      </p>
                    </div>
                  ) : (
                    <>
                      <UniversalImage
                        src={generatedImage}
                        alt="Generated by Bria AI"
                        fill
                        className="object-cover transition-opacity group-hover:opacity-95"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                      />
                      
                      {/* Preview Button Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                        <Button
                          onClick={() => openImageModal(generatedImage, prompt)}
                          size="lg"
                          className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-200 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white shadow-2xl"
                        >
                          <Maximize2 className="h-5 w-5 mr-2" />
                          Full Preview
                        </Button>
                      </div>
                    </>
                  )
                ) : isGenerating ? (
                  <div className="text-center">
                    <RefreshCw className="h-12 w-12 text-gray-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Generating your image with Bria AI...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">This may take 10-30 seconds</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Your generated image will appear here</p>
                  </div>
                )}
              </div>

              {generatedImage && (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={saveImage}
                      disabled={!user}
                      title={!user ? 'Please sign in to save images' : 'Save this image'}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={copyImageUrl}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </Button>
                  </div>
                  <Button onClick={downloadImage}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </div>

            {/* Bria AI Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">🚀 Bria AI Pro Tips</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <li>• <strong>Base Model:</strong> Best overall quality and creativity</li>
                <li>• <strong>Fast Model:</strong> Quick results in 4-10 steps</li>
                <li>• <strong>HD Model:</strong> Maximum detail at 1920×1080</li>
                <li>• <strong>Vector Model:</strong> Scalable SVG graphics</li>
                <li>• Use negative prompts to exclude unwanted elements</li>
                <li>• Higher steps = better quality but slower generation</li>
                <li>• Seed values ensure reproducible results</li>
                <li>• Prompt enhancement improves your descriptions</li>
              </ul>
            </div>

            {/* Current Settings Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Current Settings</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>Model: <span className="font-medium">{getSelectedModel().name}</span></div>
                <div>Quality: <span className="font-medium">{getSelectedQuality().name} ({getSelectedQuality().steps} steps, {getSelectedQuality().guidance} guidance)</span></div>
                <div>Medium: <span className="font-medium">{medium}</span></div>
                <div>Aspect Ratio: <span className="font-medium">{aspectRatio}</span></div>
                <div>Results: <span className="font-medium">{numResults} image{numResults > 1 ? 's' : ''}</span></div>
                {seed && <div>Seed: <span className="font-medium">{seed}</span></div>}
              </div>
            </div>
          </div>

          {/* Third Column - Saved Images */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Saved Images</h3>
              
              {loadingImages ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600 dark:text-gray-400">Loading saved images...</p>
                </div>
              ) : savedImages.length === 0 ? (
                <div className="text-center py-8">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No saved images yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {user ? 'Generate and save images to see them here' : 'Sign in to save images'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {savedImages.map((savedImage) => (
                    <div
                      key={savedImage.id}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden relative group">
                        <img
                          src={savedImage.imageUrl}
                          alt={savedImage.prompt.substring(0, 50)}
                          className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = `/api/image-proxy?url=${encodeURIComponent(savedImage.imageUrl)}`;
                          }}
                        />
                        
                        {/* Preview Icon Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                          <Button
                            onClick={() => openImageModal(savedImage.imageUrl, savedImage.prompt)}
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-200 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white shadow-xl"
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-sm text-gray-900 dark:text-white mb-2 line-clamp-2 leading-relaxed">
                          {savedImage.prompt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <span>{savedImage.modelType.toUpperCase()} v{savedImage.modelVersion}</span>
                          <span>{savedImage.aspectRatio}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <span>{savedImage.settings.qualitySetting}</span>
                          {savedImage.seed && <span>Seed: {savedImage.seed}</span>}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {savedImage.createdAt ? new Date(savedImage.createdAt).toLocaleDateString() : ''}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setGeneratedImage(savedImage.imageUrl);
                                setPrompt(savedImage.prompt);
                                setModelType(savedImage.modelType);
                                setAspectRatio(savedImage.aspectRatio);
                                if (savedImage.seed) {
                                  setSeed(savedImage.seed);
                                  setCurrentImageSeed(savedImage.seed);
                                }
                                setMedium(savedImage.settings.medium);
                                setQualitySetting(savedImage.settings.qualitySetting);
                                setPromptEnhancement(savedImage.settings.promptEnhancement);
                                setEnhanceImage(savedImage.settings.enhanceImage);
                                setNegativePrompt(savedImage.settings.negativePrompt || '');
                                toast.success('Settings restored!');
                              }}
                              className="text-xs px-2 py-1 h-7"
                            >
                              Use
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(savedImage.imageUrl);
                                toast.success('URL copied!');
                              }}
                              className="text-xs px-2 py-1 h-7"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeImage(savedImage.id)}
                              className="text-xs px-2 py-1 h-7 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Improved Image Preview Modal */}
      {modalImageUrl && (
        <ImprovedImageModal
          isOpen={isModalOpen}
          onClose={closeImageModal}
          images={[{
            id: 'current',
            imageUrl: modalImageUrl,
            prompt: modalPrompt,
            modelType: modelTypes.find(m => m.id === modelType)?.name
          }]}
          currentIndex={0}
          onIndexChange={() => {}}
        />
      )}
    </div>
  );
}