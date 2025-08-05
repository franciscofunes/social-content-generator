import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateContent } from '@/lib/apis/gemini';
import { generateImage } from '@/lib/apis/bria';
import { formatDateForId } from '@/lib/utils/date';
import { DailyContent, Post } from '@/lib/types/content';

export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json();
    const dateId = formatDateForId(new Date(date));
    
    // Check if content already exists for this date
    const dailyContentRef = doc(db, 'daily_content', dateId);
    const existingContent = await getDoc(dailyContentRef);
    
    if (existingContent.exists() && existingContent.data().generationStatus === 'completed') {
      return NextResponse.json({ 
        message: 'Content already exists for this date',
        data: existingContent.data()
      });
    }
    
    // Set status to generating
    await setDoc(dailyContentRef, {
      id: dateId,
      date: new Date(date),
      posts: [],
      generationStatus: 'generating',
      topicsUsed: []
    });
    
    try {
      // First, check if we have topics in the database
      const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000';
      
      // Try to select topics
      const topicsResponse = await fetch(`${baseUrl}/api/topics/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, excludeDays: 30 })
      });
      
      let selectedTopics;
      
      if (!topicsResponse.ok) {
        const errorData = await topicsResponse.json();
        
        // If no topics exist, generate them first
        if (errorData.error && errorData.error.includes('No topics found')) {
          console.log('No topics found, generating topics first...');
          
          // Generate topics
          const discoverResponse = await fetch(`${baseUrl}/api/topics/discover`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (!discoverResponse.ok) {
            const discoverErrorData = await discoverResponse.json().catch(() => ({ error: 'Unknown discover error' }));
            console.error('Discover topics error:', discoverErrorData);
            throw new Error(`Failed to generate initial topics: ${discoverErrorData.details || discoverErrorData.error || 'Unknown error'}`);
          }
          
          console.log('Topics generated, now selecting topics...');
          
          // Wait a moment for topics to be saved
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Try selecting topics again
          const retryTopicsResponse = await fetch(`${baseUrl}/api/topics/select`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, excludeDays: 30 })
          });
          
          if (!retryTopicsResponse.ok) {
            throw new Error('Failed to select topics after generation');
          }
          
          const retryData = await retryTopicsResponse.json();
          selectedTopics = retryData.selectedTopics;
        } else {
          throw new Error(`Failed to select topics: ${errorData.error}`);
        }
      } else {
        const data = await topicsResponse.json();
        selectedTopics = data.selectedTopics;
      }
      
      // Generate content for each topic
      const posts: Post[] = [];
      
      for (const topic of selectedTopics) {
        const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Generate content for both platforms
        const [instagramContent, linkedinContent] = await Promise.all([
          generateContent(topic, 'instagram'),
          generateContent(topic, 'linkedin')
        ]);
        
        // Generate images for both platforms
        const [instagramImageUrl, linkedinImageUrl] = await Promise.all([
          generateImage(topic.category, 'instagram'),
          generateImage(topic.category, 'linkedin')
        ]);
        
        const post: Post = {
          id: postId,
          topicId: topic.id,
          category: topic.category,
          instagramContent: {
            ...instagramContent,
            imageUrl: instagramImageUrl
          },
          linkedinContent: {
            ...linkedinContent,
            imageUrl: linkedinImageUrl
          },
          isPosted: {
            instagram: false,
            linkedin: false
          },
          createdAt: new Date()
        };
        
        posts.push(post);
      }
      
      // Save completed content
      const dailyContent: DailyContent = {
        id: dateId,
        date: new Date(date),
        posts,
        generationStatus: 'completed',
        generatedAt: new Date(),
        topicsUsed: selectedTopics.map((t: any) => t.id)
      };
      
      await setDoc(dailyContentRef, dailyContent);
      
      return NextResponse.json({
        message: 'Content generated successfully',
        data: dailyContent
      });
      
    } catch (error) {
      // Update status to error
      await setDoc(dailyContentRef, {
        id: dateId,
        date: new Date(date),
        posts: [],
        generationStatus: 'error',
        topicsUsed: []
      });
      
      throw error;
    }
    
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}