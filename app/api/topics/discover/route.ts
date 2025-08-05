import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateTopics } from '@/lib/apis/gemini';
import { generateFallbackTopics } from '@/lib/fallback-topics';

export async function POST(request: NextRequest) {
  try {
    // Check if topics already exist
    const topicsRef = collection(db, 'topics');
    const existingTopics = await getDocs(query(topicsRef, where('isArchived', '==', false)));
    
    if (existingTopics.size > 0) {
      return NextResponse.json({ 
        message: 'Topics already exist', 
        count: existingTopics.size 
      });
    }

    // Try to generate topics using Gemini, fallback if it fails
    let topics;
    let usedFallback = false;
    
    try {
      console.log('Attempting to generate topics with Gemini...');
      topics = await generateTopics();
    } catch (geminiError) {
      console.warn('Gemini API failed, using fallback topics:', geminiError);
      topics = generateFallbackTopics();
      usedFallback = true;
    }
    
    // Save topics to Firestore (remove ID field as Firestore will assign its own)
    const savePromises = topics.map(async (topic) => {
      const { id, ...topicWithoutId } = topic;
      const docRef = await addDoc(topicsRef, topicWithoutId);
      return docRef.id;
    });
    
    const firestoreIds = await Promise.all(savePromises);
    console.log(`Saved ${firestoreIds.length} topics with Firestore IDs:`, firestoreIds);
    
    return NextResponse.json({ 
      message: usedFallback ? 'Topics generated using fallback (Gemini API unavailable)' : 'Topics generated successfully with Gemini', 
      count: topics.length,
      usedFallback
    });
  } catch (error) {
    console.error('Error discovering topics:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to discover topics',
        details: errorMessage,
        type: error instanceof Error ? error.constructor.name : 'Unknown'
      },
      { status: 500 }
    );
  }
}