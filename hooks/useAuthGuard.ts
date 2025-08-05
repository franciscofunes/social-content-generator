"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseAuthGuardOptions {
  redirectOnAuth?: boolean;
  requireAuth?: boolean;
  onAuthRequired?: () => void;
  onAuthSuccess?: () => void;
}

export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const { 
    redirectOnAuth = false, 
    requireAuth = false,
    onAuthRequired,
    onAuthSuccess 
  } = options;
  
  const { user, loading } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !user) {
      setShowAuthPrompt(true);
      onAuthRequired?.();
    } else if (user) {
      setShowAuthPrompt(false);
      onAuthSuccess?.();
    }
  }, [user, loading, requireAuth, onAuthRequired, onAuthSuccess]);

  const promptAuth = () => {
    setShowAuthPrompt(true);
  };

  const dismissAuthPrompt = () => {
    setShowAuthPrompt(false);
  };

  return {
    user,
    isAuthenticated: !!user,
    loading,
    showAuthPrompt,
    promptAuth,
    dismissAuthPrompt
  };
};