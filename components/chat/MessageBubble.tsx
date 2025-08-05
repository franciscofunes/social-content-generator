'use client';

import { ChatMessage } from './ChatWrapper';
import { CopyButton } from '@/components/ui/CopyButton';
import { ImagePreview } from '@/components/ui/ImagePreview';
import { Bot, User } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils/date-format';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} slide-up`}>
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm
        ${isUser ? 'bg-blue-500' : 'bg-gray-800'}
      `}>
        {isUser ? (
          <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        ) : (
          <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[85%] sm:max-w-3xl ${isUser ? 'flex justify-end' : ''}`}>
        <div className={`
          rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-sm
          ${isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-white border border-gray-200'
          }
        `}>
          {/* Message Text */}
          <div className={`${
            isUser ? 'text-white' : 'text-gray-900'
          }`}>
            <div className="whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed">
              {message.content}
            </div>
          </div>

          {/* Image Preview */}
          {message.metadata?.imageUrl && (
            <div className="mt-3 sm:mt-4">
              <ImagePreview 
                imageUrl={message.metadata.imageUrl}
                promptUsed={message.metadata.promptUsed}
              />
            </div>
          )}

          {/* Message Actions */}
          {!isUser && (
            <div className="flex items-center justify-between mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100">
              <span className="text-xs sm:text-sm text-gray-500">
                {formatDistanceToNow(message.timestamp)}
              </span>
              <CopyButton text={message.content} />
            </div>
          )}
        </div>

        {/* User Message Timestamp */}
        {isUser && (
          <div className="mt-1 text-xs sm:text-sm text-gray-500 text-right">
            {formatDistanceToNow(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}