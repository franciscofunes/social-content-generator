import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Timestamp,
  getDoc,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
// import { FirebaseErrorHandler, withRetry, OfflineCache, ConnectionManager } from './errorHandler';

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  messageCount: number;
  lastMessage?: string;
  generationType: 'prompt' | 'image' | 'social';
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  type: 'user' | 'assistant';
  content: string;
  generationType: 'prompt' | 'image' | 'social';
  timestamp: Timestamp;
  metadata?: {
    imageUrl?: string;
    platform?: 'instagram' | 'linkedin';
    copyCount?: number;
    promptUsed?: string;
    originalInput?: string;
  };
}

// Create a new chat session with enhanced error handling
export const createChatSession = async (
  userId: string, 
  generationType: 'prompt' | 'image' | 'social',
  initialMessage: string
): Promise<string> => {
  try {
    const sessionData = {
      userId,
      title: generateSessionTitle(initialMessage, generationType),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      messageCount: 0,
      generationType,
      lastMessage: initialMessage.slice(0, 100),
      archived: false
    };
    
    const sessionRef = await addDoc(collection(db, 'chat_sessions'), sessionData);
    console.log('Created chat session:', sessionRef.id);
    
    return sessionRef.id;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw new Error('Failed to create chat session');
  }
};

// Save a chat message
export const saveChatMessage = async (
  sessionId: string,
  message: {
    type: 'user' | 'assistant';
    content: string;
    generationType: 'prompt' | 'image' | 'social';
    metadata?: {
      imageUrl?: string;
      platform?: 'instagram' | 'linkedin';
      copyCount?: number;
      promptUsed?: string;
      originalInput?: string;
    };
  }
): Promise<string> => {
  try {
    const messageData = {
      sessionId,
      type: message.type,
      content: message.content,
      generationType: message.generationType,
      timestamp: serverTimestamp(),
      ...(message.metadata && Object.keys(message.metadata).length > 0 && { metadata: message.metadata })
    };
    
    const messageRef = await addDoc(collection(db, 'chat_messages'), messageData);

    // Update session message count and last message
    const sessionRef = doc(db, 'chat_sessions', sessionId);
    const messagesQuery = query(collection(db, 'chat_messages'), where('sessionId', '==', sessionId));
    const messagesSnapshot = await getDocs(messagesQuery);
    const messageCount = messagesSnapshot.size;
    
    await updateDoc(sessionRef, {
      updatedAt: serverTimestamp(),
      messageCount: messageCount,
      lastMessage: message.content.slice(0, 100)
    });

    console.log('Saved chat message:', messageRef.id);
    return messageRef.id;
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw new Error('Failed to save chat message');
  }
};

// Load chat history for a session
export const loadChatHistory = async (sessionId: string): Promise<ChatMessage[]> => {
  try {
    const messagesRef = collection(db, 'chat_messages');
    const q = query(
      messagesRef,
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'asc')
    );
    
    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatMessage));

    console.log(`Loaded ${messages.length} messages for session ${sessionId}`);
    return messages;
  } catch (error) {
    console.error('Error loading chat history:', error);
    return [];
  }
};

// Load recent chat sessions for a user
export const loadRecentSessions = async (
  userId: string, 
  limitCount: number = 20
): Promise<ChatSession[]> => {
  try {
    const sessionsRef = collection(db, 'chat_sessions');
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatSession));

    console.log(`Loaded ${sessions.length} recent sessions for user ${userId}`);
    return sessions;
  } catch (error) {
    console.error('Error loading recent sessions:', error);
    return [];
  }
};

// Generate a session title from the first message
const generateSessionTitle = (message: string, type: 'prompt' | 'image' | 'social'): string => {
  const typePrefix = {
    prompt: '🎨 Prompt:',
    image: '🖼️ Image:',
    social: '📱 Social:'
  };
  
  const truncated = message.slice(0, 40);
  return `${typePrefix[type]} ${truncated}${truncated.length < message.length ? '...' : ''}`;
};

// Update copy count for a message (analytics)
export const incrementCopyCount = async (messageId: string): Promise<void> => {
  try {
    const messageRef = doc(db, 'chat_messages', messageId);
    const messageDoc = await getDocs(query(collection(db, 'chat_messages'), where('__name__', '==', messageId)));
    
    if (!messageDoc.empty) {
      const currentData = messageDoc.docs[0].data();
      const currentCopyCount = currentData.metadata?.copyCount || 0;
      
      await updateDoc(messageRef, {
        'metadata.copyCount': currentCopyCount + 1
      });
    }
  } catch (error) {
    console.error('Error updating copy count:', error);
    // Don't throw error for analytics failure
  }
};

// Get session statistics
export const getSessionStats = async (userId: string) => {
  try {
    const sessionsSnapshot = await getDocs(
      query(collection(db, 'chat_sessions'), where('userId', '==', userId))
    );
    
    const sessionsData = sessionsSnapshot.docs.map(doc => doc.data());
    const sessionIds = sessionsSnapshot.docs.map(doc => doc.id);
    
    if (sessionIds.length === 0) {
      return {
        totalSessions: 0,
        totalMessages: 0,
        sessionsByType: { prompt: 0, image: 0, social: 0 }
      };
    }
    
    const messagesSnapshot = await getDocs(
      query(collection(db, 'chat_messages'), where('sessionId', 'in', sessionIds))
    );

    return {
      totalSessions: sessionsSnapshot.size,
      totalMessages: messagesSnapshot.size,
      sessionsByType: {
        prompt: sessionsData.filter(session => session.generationType === 'prompt').length,
        image: sessionsData.filter(session => session.generationType === 'image').length,
        social: sessionsData.filter(session => session.generationType === 'social').length,
      }
    };
  } catch (error) {
    console.error('Error getting session stats:', error);
    return {
      totalSessions: 0,
      totalMessages: 0,
      sessionsByType: { prompt: 0, image: 0, social: 0 }
    };
  }
};

// Real-time session subscription
export const subscribeToSessions = (
  userId: string,
  callback: (sessions: ChatSession[]) => void,
  limitCount: number = 20
): Unsubscribe => {
  const sessionsRef = collection(db, 'chat_sessions');
  const q = query(
    sessionsRef,
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatSession));
    
    console.log(`Real-time update: ${sessions.length} sessions loaded`);
    callback(sessions);
  }, (error) => {
    console.error('Error in sessions subscription:', error);
    callback([]);
  });
};

// Real-time messages subscription for a session
export const subscribeToMessages = (
  sessionId: string,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe => {
  const messagesRef = collection(db, 'chat_messages');
  const q = query(
    messagesRef,
    where('sessionId', '==', sessionId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatMessage));
    
    console.log(`Real-time update: ${messages.length} messages loaded for session ${sessionId}`);
    callback(messages);
  }, (error) => {
    console.error('Error in messages subscription:', error);
    callback([]);
  });
};

// Delete a chat session and all its messages
export const deleteChatSession = async (sessionId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Get all messages for this session
    const messagesSnapshot = await getDocs(
      query(collection(db, 'chat_messages'), where('sessionId', '==', sessionId))
    );
    
    // Delete all messages
    messagesSnapshot.docs.forEach(messageDoc => {
      batch.delete(doc(db, 'chat_messages', messageDoc.id));
    });
    
    // Delete the session
    batch.delete(doc(db, 'chat_sessions', sessionId));
    
    await batch.commit();
    console.log(`Deleted session ${sessionId} and ${messagesSnapshot.size} messages`);
  } catch (error) {
    console.error('Error deleting chat session:', error);
    throw new Error('Failed to delete chat session');
  }
};

// Update session title
export const updateSessionTitle = async (sessionId: string, newTitle: string): Promise<void> => {
  try {
    const sessionRef = doc(db, 'chat_sessions', sessionId);
    await updateDoc(sessionRef, {
      title: newTitle,
      updatedAt: serverTimestamp()
    });
    console.log(`Updated session ${sessionId} title to: ${newTitle}`);
  } catch (error) {
    console.error('Error updating session title:', error);
    throw new Error('Failed to update session title');
  }
};

// Archive/unarchive a session
export const toggleSessionArchive = async (sessionId: string, archived: boolean): Promise<void> => {
  try {
    const sessionRef = doc(db, 'chat_sessions', sessionId);
    await updateDoc(sessionRef, {
      archived: archived,
      updatedAt: serverTimestamp()
    });
    console.log(`${archived ? 'Archived' : 'Unarchived'} session ${sessionId}`);
  } catch (error) {
    console.error('Error toggling session archive:', error);
    throw new Error('Failed to toggle session archive');
  }
};

// Export session to JSON
export const exportSession = async (sessionId: string): Promise<{session: ChatSession, messages: ChatMessage[]}> => {
  try {
    // Get session data
    const sessionDoc = await getDoc(doc(db, 'chat_sessions', sessionId));
    if (!sessionDoc.exists()) {
      throw new Error('Session not found');
    }
    
    const session = { id: sessionDoc.id, ...sessionDoc.data() } as ChatSession;
    
    // Get all messages
    const messages = await loadChatHistory(sessionId);
    
    return { session, messages };
  } catch (error) {
    console.error('Error exporting session:', error);
    throw new Error('Failed to export session');
  }
};

// Search sessions by title or content
export const searchSessions = async (
  userId: string,
  searchTerm: string,
  limitCount: number = 10
): Promise<ChatSession[]> => {
  try {
    // First get all user sessions
    const sessionsSnapshot = await getDocs(
      query(collection(db, 'chat_sessions'), where('userId', '==', userId))
    );
    
    // Filter by search term (client-side since Firestore doesn't support full-text search)
    const sessions = sessionsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as ChatSession))
      .filter(session => 
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())
      .slice(0, limitCount);
    
    console.log(`Found ${sessions.length} sessions matching "${searchTerm}"`);
    return sessions;
  } catch (error) {
    console.error('Error searching sessions:', error);
    return [];
  }
};

// Get sessions by type
export const getSessionsByType = async (
  userId: string,
  generationType: 'prompt' | 'image' | 'social',
  limitCount: number = 20
): Promise<ChatSession[]> => {
  try {
    const sessionsRef = collection(db, 'chat_sessions');
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      where('generationType', '==', generationType),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatSession));

    console.log(`Loaded ${sessions.length} ${generationType} sessions`);
    return sessions;
  } catch (error) {
    console.error(`Error loading ${generationType} sessions:`, error);
    return [];
  }
};