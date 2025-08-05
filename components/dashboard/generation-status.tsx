'use client';

import { Badge } from '@/components/ui/badge';

interface GenerationStatusProps {
  status?: 'pending' | 'generating' | 'completed' | 'error';
}

export function GenerationStatus({ status }: GenerationStatusProps) {
  if (!status || status === 'pending') return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'generating':
        return {
          variant: 'secondary' as const,
          text: 'Generating content...',
          icon: '⏳'
        };
      case 'completed':
        return {
          variant: 'default' as const,
          text: 'Content ready',
          icon: '✅'
        };
      case 'error':
        return {
          variant: 'destructive' as const,
          text: 'Generation failed',
          icon: '❌'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div className="mb-4 flex justify-center">
      <Badge variant={config.variant} className="px-3 py-1">
        <span className="mr-2">{config.icon}</span>
        {config.text}
      </Badge>
    </div>
  );
}