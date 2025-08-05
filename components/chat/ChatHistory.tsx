'use client';

import { useState } from 'react';
import { ChatSession } from '@/lib/firebase/chatHistory';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, Palette, Image, MessageSquare, Clock, MoreVertical, Trash2, Edit3, Download, FileImage } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils/date-format';
import UserProfile from '@/components/auth/UserProfile';
import LoginModal from '@/components/auth/LoginModal';
import Link from 'next/link';

interface ChatHistoryProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (session: ChatSession) => void;
  onNewSession: () => void;
  onDeleteSession?: (sessionId: string) => void;
  onRenameSession?: (sessionId: string, newTitle: string) => void;
  isLoading: boolean;
  stats?: {totalSessions: number, totalMessages: number, sessionsByType: any} | null;
}

const getModeIcon = (type: 'prompt' | 'image' | 'social') => {
  switch (type) {
    case 'prompt':
      return Palette;
    case 'image':
      return Image;
    case 'social':
      return MessageSquare;
  }
};

const getModeColor = (type: 'prompt' | 'image' | 'social') => {
  switch (type) {
    case 'prompt':
      return 'text-purple-600 bg-purple-50';
    case 'image':
      return 'text-blue-600 bg-blue-50';
    case 'social':
      return 'text-green-600 bg-green-50';
  }
};

export function ChatHistory({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewSession,
  onDeleteSession,
  onRenameSession,
  isLoading,
  stats
}: ChatHistoryProps) {
  const { user } = useAuth();
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleStartEdit = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveEdit = async () => {
    if (editingSessionId && onRenameSession && editingTitle.trim()) {
      await onRenameSession(editingSessionId, editingTitle.trim());
      setEditingSessionId(null);
      setEditingTitle('');
    }
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleDelete = async (sessionId: string) => {
    if (onDeleteSession) {
      await onDeleteSession(sessionId);
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        {/* Desktop Authentication Header */}
        <div className="hidden md:flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          {user ? (
            <UserProfile />
          ) : (
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">Save your work!</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLoginModal(true)}
                className="h-8 px-3 text-xs"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Chat History</h2>
          <div className="flex gap-2">
            <Link href="/gallery">
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                title="View Gallery"
              >
                <FileImage className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="default"
              size="sm"
              onClick={onNewSession}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          <p>{sessions.length} conversation{sessions.length !== 1 ? 's' : ''}</p>
          {stats && (
            <div className="mt-1 space-y-1">
              <p>{stats.totalMessages} total messages</p>
              <div className="flex gap-2 text-xs">
                <span className="text-purple-600">🎨 {stats.sessionsByType.prompt}</span>
                <span className="text-blue-600">🖼️ {stats.sessionsByType.image}</span>
                <span className="text-green-600">📱 {stats.sessionsByType.social}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2 chat-history-scroll">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No conversations yet</p>
            <p className="text-xs mt-1">Start chatting to see your history</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => {
              const Icon = getModeIcon(session.generationType);
              const colorClass = getModeColor(session.generationType);
              const isActive = currentSessionId === session.id;
              
              return (
                <div
                  key={session.id}
                  className={`
                    relative group rounded-lg transition-all duration-200 border
                    ${isActive 
                      ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' 
                      : 'hover:bg-gray-50 border-gray-100 hover:border-gray-200'
                    }
                  `}
                >
                  {/* Main Session Content */}
                  <button
                    onClick={() => onSelectSession(session)}
                    className="w-full text-left p-3"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className={`p-1 rounded ${colorClass} flex-shrink-0`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {editingSessionId === session.id ? (
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="flex-1 text-sm font-medium bg-white border border-gray-300 rounded px-2 py-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit();
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSaveEdit}
                              className="h-7 w-7 p-0"
                            >
                              ✓
                            </Button>
                          </div>
                        ) : (
                          <p className={`text-sm font-medium truncate ${
                            isActive ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {session.title}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            {session.messageCount} message{session.messageCount !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-500">
                            {session.updatedAt ? formatDistanceToNow(session.updatedAt.toDate()) : 'Recently'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Management Menu */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(session);
                        }}
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                        title="Rename conversation"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(session.id);
                        }}
                        className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
                        title="Delete conversation"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Delete Confirmation */}
                  {showDeleteConfirm === session.id && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <div className="text-center p-3">
                        <p className="text-sm font-medium text-gray-900 mb-2">Delete conversation?</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(session.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Preview of last message */}
                  {session.lastMessage && (
                    <div className="px-3 pb-3">
                      <p className="text-xs text-gray-600 truncate pl-6">
                        {session.lastMessage}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
        <p>Social Content Generator</p>
        <p className="mt-1 text-gray-400">
          {user ? 'Your conversations are saved automatically' : 'Sign in to save your conversations'}
        </p>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          title="Save Your Work"
          subtitle="Sign in to automatically save your conversations and generated content"
        />
      )}
    </div>
  );
}