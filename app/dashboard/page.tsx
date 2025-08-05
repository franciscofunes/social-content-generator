import MainLayout from '@/components/layout/MainLayout';
import NewDashboard from '@/components/dashboard/NewDashboard';

export type GenerationMode = 'prompt' | 'image' | 'social';

export default function Dashboard() {
  return (
    <MainLayout currentPage="dashboard">
      <NewDashboard />
    </MainLayout>
  );
}