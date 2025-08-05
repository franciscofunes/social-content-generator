import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { postId, platform, date } = await request.json();
    
    if (!postId || !platform || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get the daily content document
    const dailyContentRef = doc(db, 'daily_content', date);
    const dailyContentDoc = await getDoc(dailyContentRef);
    
    if (!dailyContentDoc.exists()) {
      return NextResponse.json(
        { error: 'Daily content not found' },
        { status: 404 }
      );
    }
    
    const dailyContent = dailyContentDoc.data();
    const posts = dailyContent.posts || [];
    
    // Find and update the specific post
    const updatedPosts = posts.map((post: any) => {
      if (post.id === postId) {
        return {
          ...post,
          isPosted: {
            ...post.isPosted,
            [platform]: true
          },
          postedAt: {
            ...post.postedAt,
            [platform]: new Date()
          }
        };
      }
      return post;
    });
    
    // Update the document
    await updateDoc(dailyContentRef, {
      posts: updatedPosts
    });
    
    return NextResponse.json({
      message: `Post marked as posted on ${platform}`,
      success: true
    });
    
  } catch (error) {
    console.error('Error marking post as posted:', error);
    return NextResponse.json(
      { error: 'Failed to mark post as posted' },
      { status: 500 }
    );
  }
}