import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { loadSocialPostsFromFirestore } from '@/lib/services/social-posts';

export interface DashboardStats {
  promptsGenerated: number;
  imagesCreated: number;
  socialPostsCreated: number;
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