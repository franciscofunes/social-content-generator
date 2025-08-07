import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { loadSocialPostsFromFirestore } from '@/lib/services/social-posts';
import { loadPromptsFromFirestore, loadImagesFromFirestore } from '@/lib/firestore-client';

export interface DashboardStats {
  promptsGenerated: number;
  imagesCreated: number;
  socialPostsCreated: number;
}

export interface RecentActivityItem {
  id: string;
  type: 'prompt' | 'image' | 'social';
  title: string;
  description: string;
  createdAt: string;
  icon: 'MessageSquare' | 'Image' | 'Share2';
}

// Get accurate dashboard statistics by counting actual documents
export const getDashboardStats = async (userId: string): Promise<DashboardStats> => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    // Count prompts
    const promptsRef = collection(db, 'users', userId, 'prompts');
    const promptsQuery = query(promptsRef, where('isActive', '==', true));
    const promptsSnapshot = await getDocs(promptsQuery);
    const promptsCount = promptsSnapshot.size;

    // Count images (all documents since they don't have isActive filter in the query)
    const imagesRef = collection(db, 'users', userId, 'images');
    const imagesSnapshot = await getDocs(imagesRef);
    // Filter out inactive images on client side
    const imagesCount = imagesSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.isActive !== false;
    }).length;

    // Count social posts using the existing service
    const socialPosts = await loadSocialPostsFromFirestore(userId, {}, 1000);
    const socialPostsCount = socialPosts.length;

    console.log('Dashboard stats:', {
      promptsCount,
      imagesCount,
      socialPostsCount
    });

    return {
      promptsGenerated: promptsCount,
      imagesCreated: imagesCount,
      socialPostsCreated: socialPostsCount
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return zeros if there's an error
    return {
      promptsGenerated: 0,
      imagesCreated: 0,
      socialPostsCreated: 0
    };
  }
};

// Recalculate and update user profile usage statistics
export const recalculateUserStats = async (userId: string): Promise<void> => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const stats = await getDashboardStats(userId);
    
    // Update user profile with correct counts
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'usage.promptsGenerated': stats.promptsGenerated,
      'usage.imagesCreated': stats.imagesCreated,
      'usage.socialPostsCreated': stats.socialPostsCreated,
      updatedAt: serverTimestamp()
    });

    console.log('User stats recalculated and updated:', stats);
  } catch (error) {
    console.error('Error recalculating user stats:', error);
    throw error;
  }
};

// Get recent activity from all modules
export const getRecentActivity = async (userId: string, limitCount: number = 10): Promise<RecentActivityItem[]> => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const activityItems: RecentActivityItem[] = [];

    // Get recent prompts
    try {
      const recentPrompts = await loadPromptsFromFirestore(userId, 5);
      recentPrompts.forEach(prompt => {
        activityItems.push({
          id: prompt.id,
          type: 'prompt',
          title: 'Prompt Generated',
          description: prompt.prompt.length > 60 ? prompt.prompt.substring(0, 60) + '...' : prompt.prompt,
          createdAt: prompt.createdAt || new Date().toISOString(),
          icon: 'MessageSquare'
        });
      });
    } catch (error) {
      console.warn('Error loading recent prompts:', error);
    }

    // Get recent images
    try {
      const recentImages = await loadImagesFromFirestore(userId, 5);
      recentImages.forEach(image => {
        activityItems.push({
          id: image.id,
          type: 'image',
          title: 'Image Created',
          description: image.prompt.length > 60 ? image.prompt.substring(0, 60) + '...' : image.prompt,
          createdAt: image.createdAt || new Date().toISOString(),
          icon: 'Image'
        });
      });
    } catch (error) {
      console.warn('Error loading recent images:', error);
    }

    // Get recent social posts
    try {
      const recentSocialPosts = await loadSocialPostsFromFirestore(userId, {}, 5);
      recentSocialPosts.forEach(post => {
        const platformsText = post.settings.selectedPlatforms.join(', ');
        activityItems.push({
          id: post.id,
          type: 'social',
          title: 'Social Post Created',
          description: `${post.prompt.length > 40 ? post.prompt.substring(0, 40) + '...' : post.prompt} (${platformsText})`,
          createdAt: post.createdAt,
          icon: 'Share2'
        });
      });
    } catch (error) {
      console.warn('Error loading recent social posts:', error);
    }

    // Sort all items by creation date (most recent first)
    activityItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Return limited results
    return activityItems.slice(0, limitCount);

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};