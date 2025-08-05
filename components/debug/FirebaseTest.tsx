'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createChatSession, saveChatMessage, loadRecentSessions } from '@/lib/firebase/chatHistory';

export function FirebaseTest() {
  const [status, setStatus] = useState<string>('Ready to test');
  const [results, setResults] = useState<any[]>([]);

  const addResult = (result: any) => {
    setResults(prev => [...prev, { timestamp: new Date().toISOString(), ...result }]);
  };

  const testFirebaseConfig = () => {
    setStatus('Testing Firebase configuration...');
    addResult({
      type: 'config',
      data: {
        hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasAppId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      }
    });
    setStatus('Configuration checked');
  };

  const testCreateSession = async () => {
    setStatus('Testing session creation...');
    try {
      const sessionId = await createChatSession('debug-user', 'prompt', 'Debug test message');
      addResult({
        type: 'create_session',
        success: true,
        sessionId
      });
      setStatus(`Session created: ${sessionId}`);
    } catch (error) {
      addResult({
        type: 'create_session',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      });
      setStatus('Session creation failed');
    }
  };

  const testSaveMessage = async () => {
    setStatus('Testing message saving...');
    try {
      // First create a session
      const sessionId = await createChatSession('debug-user', 'prompt', 'Debug session for message test');
      
      // Then save a message
      const messageId = await saveChatMessage(sessionId, {
        type: 'user',
        content: 'Debug test message',
        generationType: 'prompt'
      });
      
      addResult({
        type: 'save_message',
        success: true,
        sessionId,
        messageId
      });
      setStatus(`Message saved: ${messageId}`);
    } catch (error) {
      addResult({
        type: 'save_message',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      });
      setStatus('Message saving failed');
    }
  };

  const testLoadSessions = async () => {
    setStatus('Testing session loading...');
    try {
      const sessions = await loadRecentSessions('debug-user', 10);
      addResult({
        type: 'load_sessions',
        success: true,
        count: sessions.length,
        sessions: sessions.map(s => ({
          id: s.id,
          title: s.title,
          messageCount: s.messageCount
        }))
      });
      setStatus(`Loaded ${sessions.length} sessions`);
    } catch (error) {
      addResult({
        type: 'load_sessions',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      });
      setStatus('Session loading failed');
    }
  };

  const clearResults = () => {
    setResults([]);
    setStatus('Results cleared');
  };

  return (
    <div className="p-6 bg-white border border-gray-300 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Firebase Debug Panel</h2>
      
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700">Status: {status}</p>
      </div>

      <div className="space-y-2 mb-4">
        <Button onClick={testFirebaseConfig} variant="outline" size="sm">
          Test Firebase Config
        </Button>
        <Button onClick={testCreateSession} variant="outline" size="sm">
          Test Create Session
        </Button>
        <Button onClick={testSaveMessage} variant="outline" size="sm">
          Test Save Message
        </Button>
        <Button onClick={testLoadSessions} variant="outline" size="sm">
          Test Load Sessions
        </Button>
        <Button onClick={clearResults} variant="destructive" size="sm">
          Clear Results
        </Button>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2">Test Results:</h3>
        <div className="max-h-96 overflow-y-auto bg-gray-50 p-3 rounded text-xs font-mono">
          {results.length === 0 ? (
            <p className="text-gray-500">No results yet</p>
          ) : (
            results.map((result, index) => (
              <div key={index} className="mb-3 pb-2 border-b border-gray-200">
                <div className="font-semibold text-blue-600">
                  [{result.timestamp}] {result.type}
                </div>
                <pre className="whitespace-pre-wrap text-gray-700">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}