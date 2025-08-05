import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function DELETE(request: NextRequest) {
  let userId = '';
  let promptId = '';
  
  try {
    const requestData = await request.json();
    promptId = requestData.promptId;
    userId = requestData.userId;

    if (!promptId || typeof promptId !== 'string') {
      return NextResponse.json(
        { error: 'Prompt ID is required' },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    const promptRef = doc(db, 'users', userId, 'prompts', promptId);
    await updateDoc(promptRef, {
      isActive: false,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      message: 'Prompt deleted successfully',
      promptId
    });

  } catch (error) {
    console.error('Error deleting prompt:', error);
    console.error('Delete error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      userId,
      promptId
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to delete prompt',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}