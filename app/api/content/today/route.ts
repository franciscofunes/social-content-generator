import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getTodayId } from '@/lib/utils/date';

export async function GET(request: NextRequest) {
  try {
    const todayId = getTodayId();
    const dailyContentRef = doc(db, 'daily_content', todayId);
    const dailyContentDoc = await getDoc(dailyContentRef);
    
    if (!dailyContentDoc.exists()) {
      return NextResponse.json({ 
        message: 'No content found for today',
        posts: [],
        generationStatus: null
      });
    }
    
    const data = dailyContentDoc.data();
    
    // Convert Firestore timestamps to ISO strings for JSON serialization
    const serializedData = {
      ...data,
      date: data.date?.toDate?.()?.toISOString() || data.date,
      generatedAt: data.generatedAt?.toDate?.()?.toISOString() || data.generatedAt,
      posts: data.posts?.map((post: any) => ({
        ...post,
        createdAt: post.createdAt?.toDate?.()?.toISOString() || post.createdAt,
        postedAt: post.postedAt ? {
          instagram: post.postedAt.instagram?.toDate?.()?.toISOString() || post.postedAt.instagram,
          linkedin: post.postedAt.linkedin?.toDate?.()?.toISOString() || post.postedAt.linkedin
        } : undefined
      })) || []
    };
    
    return NextResponse.json(serializedData);
  } catch (error) {
    console.error('Error fetching today\'s content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today\'s content' },
      { status: 500 }
    );
  }
}