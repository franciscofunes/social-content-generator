import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  let userId = '';
  let prompt = '';
  
  try {
    const requestData = await request.json();
    userId = requestData.userId;
    prompt = requestData.prompt;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Generate a unique ID for the prompt
    const promptId = `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create prompt document
    const promptData = {
      id: promptId,
      prompt: prompt.trim(),
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      category: 'user_generated', // Default category
      isActive: true
    };

    // Save to user's prompts subcollection
    const promptRef = doc(db, 'users', userId, 'prompts', promptId);
    await setDoc(promptRef, promptData);

    return NextResponse.json({
      success: true,
      message: 'Prompt saved successfully',
      promptId,
      prompt: promptData
    });

  } catch (error) {
    console.error('Error saving prompt:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      userId,
      promptLength: prompt?.length || 0
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to save prompt',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}