import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where, orderBy, limit, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { selectDailyTopics } from '@/lib/apis/gemini';
import { isWithinDays } from '@/lib/utils/date';
import { Topic } from '@/lib/types/topic';

export async function POST(request: NextRequest) {
  try {
    const { date, excludeDays = 30 } = await request.json();
    
    // Get unused topics from last N days
    const topicsRef = collection(db, 'topics');
    
    // First check if any topics exist at all
    const allTopicsSnapshot = await getDocs(
      query(topicsRef, limit(1))
    );
    
    if (allTopicsSnapshot.empty) {
      return NextResponse.json(
        { error: 'No topics found. Please run /api/topics/discover first to generate topics.' },
        { status: 400 }
      );
    }
    
    // Get topics with the required index
    const topicsSnapshot = await getDocs(
      query(
        topicsRef,
        where('isArchived', '==', false),
        orderBy('priorityScore', 'desc'),
        limit(100)
      )
    );
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - excludeDays);
    
    const unusedTopics: Topic[] = [];
    topicsSnapshot.forEach(doc => {
      const topicData = doc.data();
      const topic = { 
        id: doc.id, // Use Firestore document ID
        ...topicData 
      } as Topic;
      
      // Check if topic hasn't been used in the last N days
      if (!topic.lastUsedDate || (topic.lastUsedDate as any).toDate() < cutoffDate) {
        unusedTopics.push(topic);
      }
    });
    
    if (unusedTopics.length < 3) {
      // If not enough unused topics, get any available topics
      const fallbackSnapshot = await getDocs(
        query(
          topicsRef,
          where('isArchived', '==', false),
          orderBy('priorityScore', 'desc'),
          limit(10)
        )
      );
      
      const allTopics: Topic[] = [];
      fallbackSnapshot.forEach(doc => {
        const topicData = doc.data();
        allTopics.push({ 
          id: doc.id, // Use Firestore document ID
          ...topicData 
        } as Topic);
      });
      
      if (allTopics.length < 3) {
        return NextResponse.json(
          { error: `Only ${allTopics.length} topics available. Need at least 3 topics.` },
          { status: 400 }
        );
      }
      
      // Use first 3 topics as fallback
      const selectedTopics = allTopics.slice(0, 3);
      return NextResponse.json({
        selectedTopics,
        totalAvailable: allTopics.length,
        fallbackUsed: true
      });
    }
    
    // Use Gemini to select diverse topics
    const selectedTopicIds = await selectDailyTopics(unusedTopics);
    
    // Update usage for selected topics
    console.log('Updating usage for selected topic IDs:', selectedTopicIds);
    
    const updatePromises = selectedTopicIds.map(async (topicId) => {
      try {
        const topicRef = doc(db, 'topics', topicId);
        
        // Check if the document exists first
        const topicDoc = await getDoc(topicRef);
        if (!topicDoc.exists()) {
          console.error(`Topic document ${topicId} does not exist!`);
          return null;
        }
        
        const currentUsageCount = topicDoc.data().usageCount || 0;
        await updateDoc(topicRef, {
          lastUsedDate: new Date(),
          usageCount: currentUsageCount + 1
        });
        
        console.log(`Successfully updated topic ${topicId}`);
        return topicId;
      } catch (error) {
        console.error(`Error updating topic ${topicId}:`, error);
        return null;
      }
    });
    
    const updateResults = await Promise.all(updatePromises);
    console.log('Update results:', updateResults);
    
    // Return selected topics
    const selectedTopics = unusedTopics.filter(topic => selectedTopicIds.includes(topic.id));
    
    return NextResponse.json({
      selectedTopics,
      totalAvailable: unusedTopics.length
    });
  } catch (error) {
    console.error('Error selecting topics:', error);
    
    // Check if it's an index error
    if ((error as any).code === 'failed-precondition') {
      return NextResponse.json(
        { 
          error: 'Firestore index required. Please deploy indexes using: firebase deploy --only firestore:indexes',
          indexError: true
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to select topics' },
      { status: 500 }
    );
  }
}