'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatWrapper';
import { GenerationMode } from '@/app/dashboard/page';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ModeSelector } from '@/components/ui/ModeSelector';
import { QuickModeSwitch } from './QuickModeSwitch';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  currentMode: GenerationMode;
  onAddMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  onModeChange: (mode: GenerationMode) => void;
  isLoading?: boolean;
}

export function ChatInterface({ 
  messages, 
  currentMode, 
  onAddMessage, 
  onModeChange, 
  isLoading = false 
}: ChatInterfaceProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    onAddMessage({
      type: 'user',
      content,
      mode: currentMode
    });

    setIsGenerating(true);

    try {
      let response: Response;
      let assistantContent: string;
      let metadata: ChatMessage['metadata'] = {};

      switch (currentMode) {
        case 'prompt':
          response = await fetch('/api/generate-prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: content })
          });
          
          if (response.ok) {
            const data = await response.json();
            assistantContent = `Here's an optimized prompt for your image generation:

**${data.prompt}**

This prompt includes specific details about lighting, composition, and style to help generate high-quality professional images. You can copy this prompt and use it in the Image Generator mode.`;
          } else {
            assistantContent = 'Sorry, I encountered an error generating the prompt. Please try again.';
          }
          break;

        case 'image':
          response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: content })
          });
          
          if (response.ok) {
            const data = await response.json();
            assistantContent = `I've generated an image based on your prompt. You can preview it below and download it for your social media posts.`;
            metadata.imageUrl = data.imageUrl;
            metadata.promptUsed = content;
          } else {
            assistantContent = 'Sorry, I encountered an error generating the image. Please try again with a different prompt.';
          }
          break;

        case 'social':
          response = await fetch('/api/generate-social', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: content })
          });
          
          if (response.ok) {
            const data = await response.json();
            assistantContent = `I've created social media content for both platforms:

**Instagram Post:**
${data.instagram.text}

**LinkedIn Post:**
${data.linkedin.text}

**Hashtags:**
${data.instagram.hashtags.join(' ')}`;
          } else {
            assistantContent = 'Sorry, I encountered an error generating social content. Please try again.';
          }
          break;

        default:
          assistantContent = 'Please select a generation mode first.';
      }

      // Add assistant response
      onAddMessage({
        type: 'assistant',
        content: assistantContent,
        mode: currentMode,
        metadata
      });

    } catch (error) {
      console.error('Generation error:', error);
      onAddMessage({
        type: 'assistant',
        content: 'Sorry, I encountered an unexpected error. Please try again.',
        mode: currentMode
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getModeInstructions = () => {
    switch (currentMode) {
      case 'prompt':
        return 'Describe the image you want to create and I\'ll generate an optimized prompt for you.';
      case 'image':
        return 'Provide an image prompt and I\'ll generate a professional image for you.';
      case 'social':
        return 'Tell me about your topic and I\'ll create engaging social media content for Instagram and LinkedIn.';
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Fixed Header with Mode Selector */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="safe-area-inset-top">
          <div className="px-4 py-4 max-w-4xl mx-auto">
            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between mb-4">
              <div className="ml-0">
                <h1 className="text-2xl font-bold text-gray-900">Social Content Generator</h1>
                <p className="text-sm text-gray-600">Previnnova Internal Tool</p>
              </div>
            </div>
            
            {/* Mobile Header - Optimized for small screens */}
            <div className="md:hidden flex items-center justify-center mb-3 sm:mb-4">
              <div className="text-center px-2">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">Content Generator</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Previnnova Tool</p>
              </div>
            </div>
            
            {/* Mode Selector - Always Visible */}
            <ModeSelector 
              currentMode={currentMode} 
              onModeChange={onModeChange}
            />
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full relative min-h-0">
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 chat-messages-scroll"
          style={{ 
            scrollBehavior: 'smooth',
            height: '100%'
          }}
        >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isGenerating && (
          <div className="flex items-center gap-3 text-gray-500 slide-up">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full">
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            </div>
            <div className="flex-1">
              <span className="text-sm sm:text-base font-medium">Generating content...</span>
              <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full loading-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
        )}
        
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4 sm:p-6 safe-area-inset-bottom flex-shrink-0">
          <div className="mb-3">
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {getModeInstructions()}
            </p>
          </div>
          <ChatInput 
            onSendMessage={handleSendMessage}
            disabled={isGenerating || isLoading}
            placeholder={`Ask me to ${currentMode === 'prompt' ? 'create a prompt' : currentMode === 'image' ? 'generate an image' : 'write social content'}...`}
            currentMode={currentMode}
          />
        </div>

        {/* Quick Mode Switch - Floating Button for long conversations */}
        {messages.length > 4 && (
          <QuickModeSwitch
            currentMode={currentMode}
            onModeChange={onModeChange}
            className="md:hidden" // Only show on mobile when header might be scrolled away
          />
        )}
      </div>
    </div>
  );
}