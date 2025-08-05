import MainLayout from '@/components/layout/MainLayout';
import ImageCreator from '@/components/images/ImageCreator';

export default function ImagesPage() {
  return (
    <MainLayout currentPage="images">
      <ImageCreator />
    </MainLayout>
  );
}