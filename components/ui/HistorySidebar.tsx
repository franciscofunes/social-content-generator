'use client';

import { GenerationMode } from '@/app/dashboard/page';
import { ChatMessage } from '@/components/chat/ChatWrapper';
import { Button } from '@/components/ui/button';
import { Trash2, Palette, Image, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils/date-format';

interface HistorySidebarProps {
  messages: ChatMessage[];
  onClearHistory: () => void;
  onSelectMessage: (message: ChatMessage) => void;
}

const getModeIcon = (mode: GenerationMode) => {
  switch (mode) {
    case 'prompt':
      return Palette;
    case 'image':
      return Image;
    case 'social':
      return MessageSquare;
  }
};

const getModeColor = (mode: GenerationMode) => {
  switch (mode) {
    case 'prompt':
      return 'text-purple-600 bg-purple-50';
    case 'image':
      return 'text-blue-600 bg-blue-50';
    case 'social':
      return 'text-green-600 bg-green-50';
  }
};

export function HistorySidebar({ messages, onClearHistory, onSelectMessage }: HistorySidebarProps) {
  // Group messages by conversation (user + assistant pairs)
  const conversations = [];
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (message.type === 'user') {
      const assistantMessage = messages[i + 1];
      if (assistantMessage && assistantMessage.type === 'assistant') {
        conversations.push({
          userMessage: message,
          assistantMessage,
          timestamp: message.timestamp
        });
        i++; // Skip the assistant message in the next iteration
      }
    } else if (message.type === 'assistant' && i === 0) {
      // Handle initial assistant message
      conversations.push({
        userMessage: null,
        assistantMessage: message,
        timestamp: message.timestamp
      });
    }
  }

  const userMessages = messages.filter(m => m.type === 'user');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-900">Chat History</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="text-gray-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          {userMessages.length} conversation{userMessages.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 1 && !conversations[0].userMessage ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            Start a conversation to see your history
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.slice().reverse().map((conversation, index) => {
              if (!conversation.userMessage) return null;
              
              const Icon = getModeIcon(conversation.userMessage.mode);
              const colorClass = getModeColor(conversation.userMessage.mode);
              
              return (
                <button
                  key={`${conversation.userMessage.id}-${index}`}
                  onClick={() => onSelectMessage(conversation.userMessage!)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div className={`p-1 rounded ${colorClass}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.userMessage.content.slice(0, 40)}
                        {conversation.userMessage.content.length > 40 ? '...' : ''}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(conversation.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Preview of assistant response */}
                  {conversation.assistantMessage.metadata?.imageUrl && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Image className="h-3 w-3" />
                      <span>Image generated</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
        <p>Previnnova Internal Tool</p>
        <p>Social Content Generator</p>
      </div>
    </div>
  );
}