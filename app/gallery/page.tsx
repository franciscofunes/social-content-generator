import MainLayout from '@/components/layout/MainLayout';
import { FirestoreImageGallery } from '@/components/gallery/FirestoreImageGallery';

export default function GalleryPage() {
  return (
    <MainLayout currentPage="gallery">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Image Gallery</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your generated images and browse your creative history
            </p>
          </div>
          
          <FirestoreImageGallery />
        </div>
      </div>
    </MainLayout>
  );
}