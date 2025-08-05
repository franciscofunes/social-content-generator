import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    console.log('Clearing all topics...');
    
    // Get all topics
    const topicsRef = collection(db, 'topics');
    const snapshot = await getDocs(topicsRef);
    
    // Delete all topics
    const deletePromises = snapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    
    console.log(`Deleted ${snapshot.docs.length} topics`);
    
    return NextResponse.json({ 
      message: `Successfully deleted ${snapshot.docs.length} topics`,
      count: snapshot.docs.length 
    });
  } catch (error) {
    console.error('Error clearing topics:', error);
    return NextResponse.json(
      { error: 'Failed to clear topics' },
      { status: 500 }
    );
  }
}