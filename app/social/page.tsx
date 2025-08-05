import MainLayout from '@/components/layout/MainLayout';
import SocialCreator from '@/components/social/SocialCreator';

export default function SocialPage() {
  return (
    <MainLayout currentPage="social">
      <SocialCreator />
    </MainLayout>
  );
}