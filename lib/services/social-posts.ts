import { 
  doc, 
  setDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SocialPost {
  id: string;
  userId: string;
  prompt: string;
  generatedContent: {
    [platform: string]: {
      text: string;
      hashtags: string[];
    };
  };
  settings: {
    contentType: string;
    tone: string;
    customInstructions?: string;
    detectedLanguage: string;
    languageOverride?: string;
    selectedPlatforms: string[];
  };
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface SocialPostsFilters {
  platform?: string;
  contentType?: string;
  language?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
}

// Save a social post to Firestore
export const saveSocialPostToFirestore = async (postData: {
  prompt: string;
  userId: string;
  generatedContent: { [platform: string]: { text: string; hashtags: string[] } };
  settings: {
    contentType: string;
    tone: string;
    customInstructions?: string;
    detectedLanguage: string;
    languageOverride?: string;
    selectedPlatforms: string[];
  };
}): Promise<SocialPost> => {
  if (!postData.prompt.trim() || !postData.userId) {
    throw new Error('Prompt and userId are required');
  }

  const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const postDocData: any = {
    prompt: postData.prompt.trim(),
    userId: postData.userId,
    generatedContent: postData.generatedContent,
    settings: postData.settings,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isActive: true
  };

  console.log('Saving social post to Firestore:', {
    postId,
    prompt: postData.prompt.substring(0, 50) + '...',
    platforms: postData.settings.selectedPlatforms,
    language: postData.settings.detectedLanguage
  });

  const postRef = doc(db, 'users', postData.userId, 'socialPosts', postId);
  await setDoc(postRef, postDocData);

  return {
    id: postId,
    ...postDocData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as SocialPost;
};

// Load saved social posts from Firestore (simplified for free tier)
export const loadSocialPostsFromFirestore = async (
  userId: string, 
  filters: SocialPostsFilters = {},
  limitCount: number = 50
): Promise<SocialPost[]> => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const postsRef = collection(db, 'users', userId, 'socialPosts');
  
  // Simple query for Firebase free tier (avoid composite indexes)
  const q = query(
    postsRef,
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  let posts = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
  })) as SocialPost[];

  // Apply all filtering on the client side to avoid complex indexes
  posts = posts.filter(post => post.isActive !== false);

  if (filters.contentType) {
    posts = posts.filter(post => 
      post.settings.contentType === filters.contentType
    );
  }

  if (filters.language) {
    posts = posts.filter(post => {
      const language = post.settings.languageOverride || post.settings.detectedLanguage;
      return language === filters.language;
    });
  }

  if (filters.platform) {
    posts = posts.filter(post => 
      post.settings.selectedPlatforms.includes(filters.platform!)
    );
  }

  if (filters.searchQuery) {
    const searchLower = filters.searchQuery.toLowerCase();
    posts = posts.filter(post => 
      post.prompt.toLowerCase().includes(searchLower) ||
      Object.values(post.generatedContent).some(content => 
        content.text.toLowerCase().includes(searchLower)
      )
    );
  }

  if (filters.dateFrom) {
    posts = posts.filter(post => 
      new Date(post.createdAt) >= filters.dateFrom!
    );
  }

  if (filters.dateTo) {
    posts = posts.filter(post => 
      new Date(post.createdAt) <= filters.dateTo!
    );
  }

  return posts;
};

// Update a social post
export const updateSocialPostInFirestore = async (
  postId: string, 
  userId: string, 
  updates: Partial<SocialPost>
): Promise<void> => {
  if (!postId || !userId) {
    throw new Error('Post ID and User ID are required');
  }

  const postRef = doc(db, 'users', userId, 'socialPosts', postId);
  await updateDoc(postRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

// Delete a social post (soft delete)
export const deleteSocialPostFromFirestore = async (
  postId: string, 
  userId: string
): Promise<void> => {
  if (!postId || !userId) {
    throw new Error('Post ID and User ID are required');
  }

  const postRef = doc(db, 'users', userId, 'socialPosts', postId);
  await updateDoc(postRef, {
    isActive: false,
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// Hard delete a social post (completely remove from database)
export const hardDeleteSocialPostFromFirestore = async (
  postId: string, 
  userId: string
): Promise<void> => {
  if (!postId || !userId) {
    throw new Error('Post ID and User ID are required');
  }

  const postRef = doc(db, 'users', userId, 'socialPosts', postId);
  await deleteDoc(postRef);
};

// Get social post statistics
export const getSocialPostsStats = async (userId: string): Promise<{
  totalPosts: number;
  postsByPlatform: { [platform: string]: number };
  postsByLanguage: { [language: string]: number };
  postsByContentType: { [type: string]: number };
  recentActivity: { date: string; count: number }[];
}> => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const posts = await loadSocialPostsFromFirestore(userId, {}, 1000); // Get more for stats

  const stats = {
    totalPosts: posts.length,
    postsByPlatform: {} as { [platform: string]: number },
    postsByLanguage: {} as { [language: string]: number },
    postsByContentType: {} as { [type: string]: number },
    recentActivity: [] as { date: string; count: number }[]
  };

  // Calculate platform distribution
  posts.forEach(post => {
    post.settings.selectedPlatforms.forEach(platform => {
      stats.postsByPlatform[platform] = (stats.postsByPlatform[platform] || 0) + 1;
    });
    
    // Language distribution
    const language = post.settings.languageOverride || post.settings.detectedLanguage;
    stats.postsByLanguage[language] = (stats.postsByLanguage[language] || 0) + 1;
    
    // Content type distribution
    stats.postsByContentType[post.settings.contentType] = 
      (stats.postsByContentType[post.settings.contentType] || 0) + 1;
  });

  // Recent activity (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  stats.recentActivity = last7Days.map(date => ({
    date,
    count: posts.filter(post => 
      post.createdAt.startsWith(date)
    ).length
  }));

  return stats;
};

// Export social posts data
export const exportSocialPostsData = async (
  userId: string,
  format: 'json' | 'csv' = 'json',
  filters: SocialPostsFilters = {}
): Promise<string> => {
  const posts = await loadSocialPostsFromFirestore(userId, filters, 1000);

  if (format === 'json') {
    return JSON.stringify(posts, null, 2);
  }

  // CSV format
  if (posts.length === 0) {
    return 'No posts found';
  }

  const csvHeaders = [
    'ID', 'Prompt', 'Created At', 'Content Type', 'Tone', 
    'Language', 'Platforms', 'Instagram Text', 'LinkedIn Text', 
    'Twitter Text', 'Facebook Text', 'TikTok Text'
  ];

  const csvRows = posts.map(post => [
    post.id,
    `"${post.prompt.replace(/"/g, '""')}"`,
    post.createdAt,
    post.settings.contentType,
    post.settings.tone,
    post.settings.languageOverride || post.settings.detectedLanguage,
    post.settings.selectedPlatforms.join(';'),
    `"${(post.generatedContent.instagram?.text || '').replace(/"/g, '""')}"`,
    `"${(post.generatedContent.linkedin?.text || '').replace(/"/g, '""')}"`,
    `"${(post.generatedContent.twitter?.text || '').replace(/"/g, '""')}"`,
    `"${(post.generatedContent.facebook?.text || '').replace(/"/g, '""')}"`,
    `"${(post.generatedContent.tiktok?.text || '').replace(/"/g, '""')}"`,
  ]);

  return [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
};