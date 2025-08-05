'use client';

import { GenerationMode } from '@/app/dashboard/page';
import { Button } from '@/components/ui/button';
import { Palette, Image, MessageSquare } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
}

const modes = [
  {
    id: 'prompt' as GenerationMode,
    name: 'Prompt Generator',
    description: 'Create optimized prompts for image generation',
    icon: Palette,
    color: 'bg-purple-500 text-white',
    colorHover: 'hover:bg-purple-600',
    colorInactive: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
  },
  {
    id: 'image' as GenerationMode,
    name: 'Image Generator',
    description: 'Generate professional images from prompts',
    icon: Image,
    color: 'bg-blue-500 text-white',
    colorHover: 'hover:bg-blue-600',
    colorInactive: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
  },
  {
    id: 'social' as GenerationMode,
    name: 'Social Content',
    description: 'Create engaging posts for Instagram & LinkedIn',
    icon: MessageSquare,
    color: 'bg-green-500 text-white',
    colorHover: 'hover:bg-green-600',
    colorInactive: 'bg-green-50 text-green-700 hover:bg-green-100'
  }
];

export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:gap-2">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;
        
        return (
          <Button
            key={mode.id}
            variant="ghost"
            className={`
              flex-1 min-h-[52px] sm:min-h-[56px] md:min-h-[64px] 
              p-3 sm:p-4 md:p-5 h-auto 
              flex flex-row md:flex-col items-center md:items-start 
              gap-3 sm:gap-3 md:gap-2 
              transition-all duration-200 rounded-xl active:scale-[0.98] 
              touch-manipulation smooth-transition press-animation touch-feedback
              text-left w-full
              ${isActive 
                ? `${mode.color} ${mode.colorHover} shadow-md scale-in` 
                : `${mode.colorInactive} border border-gray-200 hover:shadow-sm hover:scale-[1.01]`
              }
            `}
            onClick={() => onModeChange(mode.id)}
          >
            <div className="flex items-center gap-3 md:gap-2 w-full justify-start md:justify-start">
              <Icon className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0" />
              <div className="flex-1 md:flex-none md:w-full">
                <span className="font-semibold text-sm sm:text-base block">{mode.name}</span>
                {/* Mobile-friendly description - shown inline on mobile */}
                <p className={`text-xs leading-tight mt-0.5 md:hidden ${
                  isActive ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {mode.description.split(' ').slice(0, 4).join(' ')}...
                </p>
              </div>
            </div>
            
            {/* Full description - Desktop only */}
            <p className={`hidden md:block text-xs md:text-sm text-left leading-relaxed mt-2 ${
              isActive ? 'text-white/90' : 'text-gray-600'
            }`}>
              {mode.description}
            </p>
          </Button>
        );
      })}
    </div>
  );
}