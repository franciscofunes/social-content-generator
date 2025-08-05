'use client';

import { GenerationMode } from '@/app/dashboard/page';
import { Button } from '@/components/ui/button';
import { Palette, Image, MessageSquare } from 'lucide-react';

interface MobileNavigationProps {
  currentMode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
}

const modes = [
  {
    id: 'prompt' as GenerationMode,
    name: 'Prompt',
    icon: Palette,
    color: 'text-purple-600',
    activeColor: 'text-purple-600 bg-purple-50'
  },
  {
    id: 'image' as GenerationMode,
    name: 'Image',
    icon: Image,
    color: 'text-blue-600',
    activeColor: 'text-blue-600 bg-blue-50'
  },
  {
    id: 'social' as GenerationMode,
    name: 'Social',
    icon: MessageSquare,
    color: 'text-green-600',
    activeColor: 'text-green-600 bg-green-50'
  }
];

export function MobileNavigation({ currentMode, onModeChange }: MobileNavigationProps) {
  return (
    <div className="bg-white border-t border-gray-200 safe-area-pb">
      {/* Simplified - just show current mode as indicator */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = currentMode === mode.id;
            
            return (
              <div
                key={mode.id}
                className={`
                  flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-200
                  ${isActive 
                    ? `${mode.activeColor} font-medium` 
                    : `text-gray-400`
                  }
                `}
              >
                <Icon className="h-3 w-3" />
                {isActive && <span>{mode.name}</span>}
              </div>
            );
          })}
        </div>
        
        {/* Current mode description */}
        <p className="text-xs text-center text-gray-500 mt-2">
          {currentMode === 'prompt' && 'Creating optimized prompts for image generation'}
          {currentMode === 'image' && 'Generating professional images from prompts'}
          {currentMode === 'social' && 'Creating engaging social media content'}
        </p>
      </div>
    </div>
  );
}