'use client';

import { useState, useEffect } from 'react';
import { ChatInterface } from './ChatInterface';
import { ChatHistory } from './ChatHistory';
import { MobileNavigation } from './MobileNavigation';
import { GenerationMode } from '@/app/dashboard/page';
import { 
  createChatSession, 
  saveChatMessage, 
  loadChatHistory, 
  loadRecentSessions,
  subscribeToSessions,
  subscribeToMessages,
  deleteChatSession,
  updateSessionTitle,
  getSessionStats,
  ChatSession,
  ChatMessage as FirestoreChatMessage
} from '@/lib/firebase/chatHistory';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, Plus } from 'lucide-react';
import UserProfile from '@/components/auth/UserProfile';
import LoginModal from '@/components/auth/LoginModal';

interface ChatWrapperProps {
  children?: React.ReactNode;
  initialMode?: GenerationMode;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  mode: GenerationMode;
  timestamp: Date;
  metadata?: {
    imageUrl?: string;
    platform?: 'instagram' | 'linkedin';
    promptUsed?: string;
    messageId?: string; // Firestore message ID for analytics
  };
}

export function ChatWrapper({ children, initialMode = 'prompt' }: ChatWrapperProps) {
  const { user, loading: authLoading } = useAuth();
  const [currentMode, setCurrentMode] = useState<GenerationMode>(initialMode);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{totalSessions: number, totalMessages: number, sessionsByType: any} | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Use authenticated user ID or fallback to anonymous
  const userId = user?.uid || 'anonymous-user';

  // Set up real-time session subscription
  useEffect(() => {
    console.log('Setting up real-time session subscription...');
    setIsLoading(true);
    
    const unsubscribe = subscribeToSessions(userId, (realtimeSessions) => {
      setSessions(realtimeSessions);
      setIsLoading(false);
    });

    // Load initial stats
    const loadStats = async () => {
      try {
        const sessionStats = await getSessionStats(userId);
        setStats(sessionStats);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };
    loadStats();

    return () => {
      console.log('Cleaning up session subscription');
      unsubscribe();
    };
  }, [userId]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeContent = user ? 
        `Welcome back, ${user.displayName || 'User'}! I'm your AI assistant for creating social media content. I can help you in three ways:

🎨 **Prompt Generator**: I'll create optimized prompts for image generation
🖼️ **Image Generator**: I'll generate professional images from prompts  
📱 **Social Content**: I'll create engaging posts for Instagram and LinkedIn

Your conversations and generated content are automatically saved to your account. What would you like to create today?` :
        `¡Hola! I'm your AI assistant for creating social media content. I can help you in three ways:

🎨 **Prompt Generator**: I'll create optimized prompts for image generation
🖼️ **Image Generator**: I'll generate professional images from prompts  
📱 **Social Content**: I'll create engaging posts for Instagram and LinkedIn

💡 **Tip**: Sign in to automatically save your conversations and generated content!

What would you like to create today?`;

      setMessages([{
        id: 'welcome',
        type: 'assistant',
        content: welcomeContent,
        mode: currentMode,
        timestamp: new Date()
      }]);
    }
  }, [currentMode, messages.length, user]);

  const startNewSession = () => {
    setMessages([{
      id: 'welcome',
      type: 'assistant',
      content: `¡Hola! I'm your AI assistant for creating social media content. What would you like to create today?`,
      mode: currentMode,
      timestamp: new Date()
    }]);
    setCurrentSessionId(null);
    setShowHistory(false);
  };

  const loadSession = async (session: ChatSession) => {
    try {
      setIsLoading(true);
      const firestoreMessages = await loadChatHistory(session.id);
      
      // Convert Firestore messages to ChatMessage format
      const chatMessages: ChatMessage[] = firestoreMessages.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        mode: msg.generationType,
        timestamp: msg.timestamp.toDate(),
        metadata: {
          ...msg.metadata,
          messageId: msg.id
        }
      }));

      setMessages(chatMessages);
      setCurrentSessionId(session.id);
      setCurrentMode(session.generationType);
      setShowHistory(false);
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    // Add to local state immediately for responsive UI
    setMessages(prev => [...prev, newMessage]);

    // Save to Firestore in the background
    try {
      // Create session if this is the first user message
      if (!currentSessionId && message.type === 'user') {
        const sessionId = await createChatSession(userId, message.mode, message.content);
        setCurrentSessionId(sessionId);
        
        // Save this message to the new session
        const messageId = await saveChatMessage(sessionId, {
          type: message.type,
          content: message.content,
          generationType: message.mode,
          ...(message.metadata && { metadata: message.metadata })
        });
        
        // Update local message with Firestore ID
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, metadata: { ...msg.metadata, messageId } }
            : msg
        ));
      } else if (currentSessionId) {
        // Save to existing session
        const messageId = await saveChatMessage(currentSessionId, {
          type: message.type,
          content: message.content,
          generationType: message.mode,
          ...(message.metadata && { metadata: message.metadata })
        });
        
        // Update local message with Firestore ID
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, metadata: { ...msg.metadata, messageId } }
            : msg
        ));
      }

      // Sessions will update automatically via real-time subscription
    } catch (error) {
      console.error('Error saving message to Firestore:', error);
      // Message still shows in UI even if Firestore save fails
    }
  };

  // Delete session function
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId);
      
      // If we're currently viewing the deleted session, start a new one
      if (currentSessionId === sessionId) {
        startNewSession();
      }
      
      // Update stats
      const newStats = await getSessionStats(userId);
      setStats(newStats);
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  // Rename session function
  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    try {
      await updateSessionTitle(sessionId, newTitle);
    } catch (error) {
      console.error('Error renaming session:', error);
    }
  };

  return (
    <div className="flex h-screen-mobile bg-gray-50">
      {/* Top Header with Authentication */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="bg-white shadow-sm rounded-full min-h-[40px] min-w-[40px]"
          onClick={() => setShowHistory(!showHistory)}
          aria-label={showHistory ? "Close chat history" : "Open chat history"}
        >
          {showHistory ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <div className="flex items-center gap-2">
          {user ? (
            <UserProfile />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLoginModal(true)}
              className="text-xs px-3 py-1 h-8"
            >
              Sign In
            </Button>
          )}
          
          <Button
            variant="default"
            size="icon"
            className="shadow-sm rounded-full min-h-[40px] min-w-[40px]"
            onClick={startNewSession}
            aria-label="Start new chat"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Desktop Header - integrated into sidebar */}

      {/* Chat History Sidebar */}
      <div className={`
        ${showHistory ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 transition-transform duration-300 ease-in-out
        fixed md:static inset-y-0 left-0 z-40
        w-80 sm:w-96 bg-white border-r border-gray-200
        flex flex-col safe-area-inset-top safe-area-inset-bottom
      `}>
        <ChatHistory 
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={loadSession}
          onNewSession={startNewSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          isLoading={isLoading}
          stats={stats}
        />
      </div>

      {/* Overlay for mobile */}
      {showHistory && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setShowHistory(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Chat Interface */}
        <div className="flex-1 min-h-0 pt-16 md:pt-0">
          <ChatInterface
            messages={messages}
            currentMode={currentMode}
            onAddMessage={addMessage}
            onModeChange={setCurrentMode}
            isLoading={isLoading}
          />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNavigation 
            currentMode={currentMode}
            onModeChange={setCurrentMode}
          />
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          title="Welcome to Content Generator"
          subtitle="Sign in to save your conversations and access your content history"
        />
      )}

      {/* Keep existing generators as fallback - hidden but functional */}
      <div className="hidden">
        {children}
      </div>
    </div>
  );
}