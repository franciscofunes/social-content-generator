"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  UserCredential 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: any;
  lastLoginAt?: any;
  preferences?: {
    theme: 'light' | 'dark';
    defaultTool: 'prompt' | 'image' | 'social';
    autoSave: boolean;
  };
  usage?: {
    promptsGenerated: number;
    imagesCreated: number;
    socialPostsCreated: number;
    storageUsed: number;
  };
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<UserCredential | null>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize user profile on first sign-in
  const initializeUserProfile = async (user: User): Promise<UserProfile> => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Create new user profile
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          preferences: {
            theme: 'light',
            defaultTool: 'prompt',
            autoSave: true
          },
          usage: {
            promptsGenerated: 0,
            imagesCreated: 0,
            socialPostsCreated: 0,
            storageUsed: 0
          }
        };
        
        await setDoc(userRef, newProfile);
        console.log('Created new user profile:', user.uid);
        return newProfile;
      } else {
        // Update last login time
        const existingProfile = { uid: user.uid, ...userSnap.data() } as UserProfile;
        await setDoc(userRef, { 
          ...existingProfile,
          lastLoginAt: serverTimestamp(),
          // Update profile data from auth
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }, { merge: true });
        
        console.log('Updated existing user profile:', user.uid);
        return existingProfile;
      }
    } catch (error) {
      console.error('Error initializing user profile:', error);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<UserCredential | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Configure Google provider
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign-in successful:', result.user.uid);
      
      // Initialize user profile
      await initializeUserProfile(result.user);
      
      return result;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Handle specific auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups and try again.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await signOut(auth);
      setUserProfile(null);
      console.log('User signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) throw new Error('No authenticated user');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, updates, { merge: true });
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
      console.log('User profile updated:', updates);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setLoading(true);
        setError(null);
        
        if (user) {
          console.log('User authenticated:', user.uid);
          setUser(user);
          
          // Load user profile
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const profile = { uid: user.uid, ...userSnap.data() } as UserProfile;
            setUserProfile(profile);
          } else {
            // Initialize profile if it doesn't exist
            const profile = await initializeUserProfile(user);
            setUserProfile(profile);
          }
        } else {
          console.log('User not authenticated');
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setError('Failed to load user data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    signInWithGoogle,
    logout,
    updateUserProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};