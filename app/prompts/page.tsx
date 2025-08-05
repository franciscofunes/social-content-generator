import MainLayout from '@/components/layout/MainLayout';
import PromptGenerator from '@/components/prompts/PromptGenerator';

export default function PromptsPage() {
  return (
    <MainLayout currentPage="prompts">
      <PromptGenerator />
    </MainLayout>
  );
}