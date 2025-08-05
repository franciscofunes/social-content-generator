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
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SavedPrompt } from '@/lib/types/prompt';

export interface SavedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  modelType: string;
  modelVersion: string;
  aspectRatio: string;
  seed?: number;
  settings: {
    medium: string;
    qualitySetting: string;
    steps: number;
    guidance: number;
    promptEnhancement: boolean;
    enhanceImage: boolean;
    negativePrompt?: string;
  };
  isActive?: boolean; // Make optional with default true
}

// Save a prompt to Firestore (client-side)
export const savePromptToFirestore = async (prompt: string, userId: string): Promise<SavedPrompt> => {
  if (!prompt.trim() || !userId) {
    throw new Error('Prompt and userId are required');
  }

  const promptId = `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const promptData = {
    id: promptId,
    prompt: prompt.trim(),
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    category: 'user_generated',
    isActive: true
  };

  const promptRef = doc(db, 'users', userId, 'prompts', promptId);
  await setDoc(promptRef, promptData);

  // Update user usage statistics
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    'usage.promptsGenerated': increment(1),
    updatedAt: serverTimestamp()
  });

  return {
    ...promptData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Load saved prompts from Firestore (client-side)
export const loadPromptsFromFirestore = async (userId: string, limitCount: number = 50): Promise<SavedPrompt[]> => {
  if (!userId) {
    throw new Error('User ID is required');
  }

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
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
  })) as SavedPrompt[];

  return prompts;
};

// Delete a prompt from Firestore (client-side soft delete)
export const deletePromptFromFirestore = async (promptId: string, userId: string): Promise<void> => {
  if (!promptId || !userId) {
    throw new Error('Prompt ID and User ID are required');
  }

  const promptRef = doc(db, 'users', userId, 'prompts', promptId);
  await updateDoc(promptRef, {
    isActive: false,
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// Simplified save image function for Firebase free tier
export const saveImageToFirestore = async (imageData: {
  imageUrl: string;
  prompt: string;
  userId: string;
  modelType: string;
  modelVersion: string;
  aspectRatio: string;
  seed?: number;
  settings: {
    medium: string;
    qualitySetting: string;
    steps: number;
    guidance: number;
    promptEnhancement: boolean;
    enhanceImage: boolean;
    negativePrompt?: string;
  };
}): Promise<SavedImage> => {
  if (!imageData.imageUrl || !imageData.prompt.trim() || !imageData.userId) {
    throw new Error('Image URL, prompt, and userId are required');
  }

  const imageId = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Build minimal document data for free tier
  const imageDocData: any = {
    imageUrl: imageData.imageUrl,
    prompt: imageData.prompt.trim(),
    userId: imageData.userId,
    modelType: imageData.modelType,
    modelVersion: imageData.modelVersion,
    aspectRatio: imageData.aspectRatio,
    settings: imageData.settings,
    createdAt: serverTimestamp()
  };

  // Only add seed if it exists
  if (imageData.seed !== undefined) {
    imageDocData.seed = imageData.seed;
  }

  console.log('Saving simple image data to Firestore:', {
    imageUrl: imageData.imageUrl,
    prompt: imageData.prompt.substring(0, 50) + '...',
    modelType: imageData.modelType,
    aspectRatio: imageData.aspectRatio
  });

  const imageRef = doc(db, 'users', imageData.userId, 'images', imageId);
  await setDoc(imageRef, imageDocData);

  // Update user usage statistics
  const userRef = doc(db, 'users', imageData.userId);
  await updateDoc(userRef, {
    'usage.imagesCreated': increment(1),
    updatedAt: serverTimestamp()
  });

  return {
    id: imageId,
    ...imageDocData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as SavedImage;
};

// Load saved images from Firestore (client-side) - Simplified for free tier
export const loadImagesFromFirestore = async (userId: string, limitCount: number = 20): Promise<SavedImage[]> => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const imagesRef = collection(db, 'users', userId, 'images');
  const q = query(
    imagesRef,
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  const images = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
  })) as SavedImage[];

  // Filter out inactive images on the client side
  return images.filter(img => img.isActive !== false);
};

// Delete an image from Firestore (hard delete for free tier)
export const deleteImageFromFirestore = async (imageId: string, userId: string): Promise<void> => {
  if (!imageId || !userId) {
    throw new Error('Image ID and User ID are required');
  }

  const imageRef = doc(db, 'users', userId, 'images', imageId);
  
  // For free tier, just delete the document completely
  try {
    await updateDoc(imageRef, {
      isActive: false
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};