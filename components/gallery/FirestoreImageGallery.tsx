'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  LayoutGrid, 
  List,
  Calendar,
  Tag,
  Loader2,
  RefreshCw,
  ImageIcon,
  Moon,
  Sun
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ImprovedImageModal } from '@/components/ui/ImprovedImageModal';
import { UniversalImage } from '@/components/ui/UniversalImage';
import { loadImagesFromFirestore, deleteImageFromFirestore, SavedImage } from '@/lib/firestore-client';

interface FirestoreImageGalleryProps {
  className?: string;
}

export function FirestoreImageGallery({ className = '' }: FirestoreImageGalleryProps) {
  const { user } = useAuth();
  const [images, setImages] = useState<SavedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt:desc');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode preference
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const loadImages = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Loading images from Firestore for user:', user.uid);
      
      const userImages = await loadImagesFromFirestore(user.uid, 50);
      console.log(`Loaded ${userImages.length} images from Firestore`);
      
      // Sort images based on sortBy
      const sortedImages = [...userImages].sort((a, b) => {
        const [field, direction] = sortBy.split(':');
        const aValue = field === 'createdAt' ? new Date(a.createdAt).getTime() : a[field as keyof SavedImage];
        const bValue = field === 'createdAt' ? new Date(b.createdAt).getTime() : b[field as keyof SavedImage];
        
        if (direction === 'desc') {
          return (bValue as number) - (aValue as number);
        } else {
          return (aValue as number) - (bValue as number);
        }
      });
      
      setImages(sortedImages);
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Failed to load images');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [user, sortBy]);

  const handleImageClick = (image: SavedImage) => {
    const index = filteredImages.findIndex(img => img.id === image.id);
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!user) {
      toast.error('Please sign in to delete images');
      return;
    }

    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await deleteImageFromFirestore(imageId, user.uid);
      toast.success('Image deleted successfully');
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleDownloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed');
    }
  };

  const filteredImages = images.filter(image => {
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        image.prompt.toLowerCase().includes(searchLower) ||
        image.modelType.toLowerCase().includes(searchLower) ||
        image.aspectRatio.toLowerCase().includes(searchLower)
      );
      if (!matchesSearch) return false;
    }
    
    // Filter by model type
    if (filterType !== 'all') {
      return image.modelType.toLowerCase().includes(filterType.toLowerCase());
    }
    
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-12 text-center">
          <ImageIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sign In Required</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to view your generated images
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Image Gallery</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filteredImages.length} of {images.length} images
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={toggleDarkMode} variant="ghost" size="sm">
              {isDarkMode ? (
                <Sun className="h-4 w-4 mr-2" />
              ) : (
                <Moon className="h-4 w-4 mr-2" />
              )}
              {isDarkMode ? 'Light' : 'Dark'}
            </Button>
            <Button onClick={loadImages} variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search prompts, models, or aspect ratios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filter by Model Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Models</option>
            <option value="bria-hd">BRIA HD</option>
            <option value="bria-standard">BRIA Standard</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
          </select>

          {/* View Mode */}
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none border-l border-gray-300 dark:border-gray-600"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading images...</span>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <LayoutGrid className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No images found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Start by generating some images with BRIA AI'
              }
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-square cursor-pointer hover:shadow-lg transition-all duration-200"
                onClick={() => handleImageClick(image)}
              >
                <UniversalImage
                  src={image.imageUrl}
                  alt={image.prompt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200">
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <p className="text-white text-xs line-clamp-2 mb-2">
                      {image.prompt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-white/80 text-xs">
                        <div>{image.modelType}</div>
                        <div>{formatDate(image.createdAt)}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 hover:bg-white/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadImage(image.imageUrl, image.prompt);
                          }}
                        >
                          <Download className="h-3 w-3 text-white" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 hover:bg-red-500/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(image.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-white" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <UniversalImage
                    src={image.imageUrl}
                    alt={image.prompt}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {image.modelType} - {image.aspectRatio}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                    {image.prompt}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{image.modelVersion}</span>
                    <span>{formatDate(image.createdAt)}</span>
                    {image.seed && <span>Seed: {image.seed}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleImageClick(image)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownloadImage(image.imageUrl, image.prompt)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteImage(image.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Improved Image Modal with Navigation */}
      {filteredImages.length > 0 && (
        <ImprovedImageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          images={filteredImages.map(img => ({
            id: img.id,
            imageUrl: img.imageUrl,
            prompt: img.prompt,
            modelType: img.modelType,
            createdAt: img.createdAt
          }))}
          currentIndex={selectedImageIndex}
          onIndexChange={setSelectedImageIndex}
        />
      )}
    </div>
  );
}