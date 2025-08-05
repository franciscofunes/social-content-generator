import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    // Test basic Firebase connection
    console.log('Testing Firebase connection...');
    console.log('Database instance:', !!db);
    
    return NextResponse.json({
      success: true,
      message: 'Firebase connection test',
      hasDb: !!db,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Firebase test error:', error);
    
    return NextResponse.json(
      { 
        error: 'Firebase connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let userId = '';
  let testPrompt = '';
  
  try {
    const requestData = await request.json();
    userId = requestData.userId || 'test-user-123';
    testPrompt = requestData.prompt || 'Test prompt for debugging';

    console.log('Testing prompt save with:', { userId, promptLength: testPrompt.length });

    // Test creating a simple document first (not in subcollection)
    // This will help us identify if it's a subcollection or auth issue
    
    return NextResponse.json({
      success: true,
      message: 'Test endpoint - not actually saving yet',
      userId,
      promptLength: testPrompt.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        userId,
        promptLength: testPrompt?.length || 0
      },
      { status: 500 }
    );
  }
}