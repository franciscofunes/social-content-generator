import { NextRequest, NextResponse } from 'next/server';
import { createChatSession, saveChatMessage, loadRecentSessions } from '@/lib/firebase/chatHistory';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing Firebase connection...');
    
    // Test 1: Create a session
    const sessionId = await createChatSession('test-user', 'prompt', 'Test message for Firebase connection');
    console.log('✅ Test session created:', sessionId);
    
    // Test 2: Save a message
    const messageId = await saveChatMessage(sessionId, {
      type: 'user',
      content: 'Test message for Firebase connection',
      generationType: 'prompt'
    });
    console.log('✅ Test message saved:', messageId);
    
    // Test 3: Load sessions
    const sessions = await loadRecentSessions('test-user', 5);
    console.log('✅ Loaded sessions:', sessions.length);
    
    return NextResponse.json({
      success: true,
      sessionId,
      messageId,
      sessionsCount: sessions.length,
      sessions: sessions.map(s => ({
        id: s.id,
        title: s.title,
        messageCount: s.messageCount,
        generationType: s.generationType
      }))
    });
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Simple read test
    const sessions = await loadRecentSessions('test-user', 5);
    
    return NextResponse.json({
      success: true,
      sessionsCount: sessions.length,
      sessions: sessions.map(s => ({
        id: s.id,
        title: s.title,
        messageCount: s.messageCount,
        generationType: s.generationType,
        createdAt: s.createdAt?.toDate?.()?.toISOString() || 'unknown'
      }))
    });
  } catch (error) {
    console.error('❌ Firebase read test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}