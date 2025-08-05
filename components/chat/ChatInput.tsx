'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Palette, Image, MessageSquare } from 'lucide-react';
import { GenerationMode } from '@/app/dashboard/page';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  currentMode?: GenerationMode;
}

const getModeIcon = (mode?: GenerationMode) => {
  switch (mode) {
    case 'prompt':
      return Palette;
    case 'image':
      return Image;
    case 'social':
      return MessageSquare;
    default:
      return Send;
  }
};

const getModeColor = (mode?: GenerationMode) => {
  switch (mode) {
    case 'prompt':
      return 'text-purple-600';
    case 'image':
      return 'text-blue-600';
    case 'social':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

export function ChatInput({ onSendMessage, disabled = false, placeholder = "Type your message...", currentMode }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const ModeIcon = getModeIcon(currentMode);
  const SendIcon = message.trim() ? Send : ModeIcon;

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 items-end">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full resize-none rounded-xl border border-gray-300 
            px-3 sm:px-4 py-3 pr-10 sm:pr-12
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500
            min-h-[48px] sm:min-h-[52px] max-h-[120px]
            text-base leading-relaxed
            touch-manipulation
          `}
          rows={1}
          style={{ fontSize: '16px' }} // Prevent iOS zoom
        />
        
        {/* Character count for longer messages */}
        {message.length > 100 && (
          <div className="absolute bottom-1 right-12 text-xs text-gray-400">
            {message.length}
          </div>
        )}
      </div>
      
      <Button
        type="submit"
        disabled={!message.trim() || disabled}
        className={`
          h-12 w-12 sm:h-12 sm:w-12 rounded-xl flex-shrink-0 
          transition-all duration-200 active:scale-95 touch-manipulation
          ${message.trim() 
            ? 'bg-primary hover:bg-primary/90 shadow-md' 
            : `bg-gray-100 hover:bg-gray-200 ${getModeColor(currentMode)}`
          }
        `}
        size="icon"
      >
        <SendIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
    </form>
  );
}