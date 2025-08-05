import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  let userId = '';
  let limitCount = 50;
  
  try {
    const { searchParams } = new URL(request.url);
    userId = searchParams.get('userId') || '';
    limitCount = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Query user's saved prompts
    const promptsRef = collection(db, 'users', userId, 'prompts');
    const q = query(
      promptsRef,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const prompts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps to ISO strings for JSON serialization
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
    }));

    return NextResponse.json({
      success: true,
      prompts,
      count: prompts.length
    });

  } catch (error) {
    console.error('Error loading prompts:', error);
    console.error('Load error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      userId,
      limitCount
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to load prompts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}