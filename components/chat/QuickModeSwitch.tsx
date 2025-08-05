'use client';

import { useState } from 'react';
import { GenerationMode } from '@/app/dashboard/page';
import { Button } from '@/components/ui/button';
import { Palette, Image, MessageSquare, ChevronUp } from 'lucide-react';

interface QuickModeSwitchProps {
  currentMode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
  className?: string;
}

const modes = [
  {
    id: 'prompt' as GenerationMode,
    name: 'Prompt',
    icon: Palette,
    color: 'bg-purple-500 hover:bg-purple-600 text-white'
  },
  {
    id: 'image' as GenerationMode,
    name: 'Image',
    icon: Image,
    color: 'bg-blue-500 hover:bg-blue-600 text-white'
  },
  {
    id: 'social' as GenerationMode,
    name: 'Social',
    icon: MessageSquare,
    color: 'bg-green-500 hover:bg-green-600 text-white'
  }
];

export function QuickModeSwitch({ currentMode, onModeChange, className = '' }: QuickModeSwitchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const currentModeData = modes.find(m => m.id === currentMode)!;
  const otherModes = modes.filter(m => m.id !== currentMode);

  return (
    <div className={`fixed bottom-24 right-4 z-20 ${className}`}>
      {/* Expanded Mode Options */}
      {isExpanded && (
        <div className="mb-2 space-y-2">
          {otherModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Button
                key={mode.id}
                size="sm"
                className={`${mode.color} shadow-lg flex items-center gap-2 transition-all duration-200`}
                onClick={() => {
                  onModeChange(mode.id);
                  setIsExpanded(false);
                }}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{mode.name}</span>
              </Button>
            );
          })}
        </div>
      )}

      {/* Main Toggle Button */}
      <Button
        size="sm"
        className={`${currentModeData.color} shadow-lg flex items-center gap-2 transition-all duration-200`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <currentModeData.icon className="h-4 w-4" />
        <span className="text-sm">{currentModeData.name}</span>
        <ChevronUp className={`h-3 w-3 transition-transform duration-200 ${
          isExpanded ? 'rotate-180' : ''
        }`} />
      </Button>
    </div>
  );
}