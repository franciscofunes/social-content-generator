"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  MessageSquare, 
  Image, 
  Share2,
  Crown
} from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, userProfile, logout, loading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number | 'auto';
    left: number | 'auto';
    right: number | 'auto';
    bottom: number | 'auto';
  }>({ top: 'auto', left: 'auto', right: 'auto', bottom: 'auto' });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const calculateDropdownPosition = useCallback(() => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const dropdownWidth = 320; // w-80 = 320px
    const dropdownHeight = 400; // approximate height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let position: {
      top: number | 'auto';
      left: number | 'auto';
      right: number | 'auto';
      bottom: number | 'auto';
    } = {
      top: 'auto',
      left: 'auto',
      right: 'auto',
      bottom: 'auto'
    };

    // Determine horizontal position
    const spaceOnRight = viewportWidth - buttonRect.right;
    const spaceOnLeft = buttonRect.left;

    if (spaceOnRight >= dropdownWidth) {
      // Enough space on the right
      position.left = buttonRect.left + scrollX;
    } else if (spaceOnLeft >= dropdownWidth) {
      // Not enough space on right, but enough on left
      position.right = viewportWidth - buttonRect.right - scrollX;
    } else {
      // Not enough space on either side, center it or align to viewport
      if (viewportWidth <= 768) {
        // Mobile: make it full width with padding
        position.left = 16 + scrollX;
        position.right = 16;
      } else {
        // Desktop: align to right edge of viewport
        position.right = 16;
      }
    }

    // Determine vertical position
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
      // Open downward
      position.top = buttonRect.bottom + scrollY + 8;
    } else {
      // Open upward
      position.bottom = viewportHeight - buttonRect.top - scrollY + 8;
    }

    setDropdownPosition(position);
  }, []);

  // All hooks must be called before any conditional returns
  // Recalculate position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isDropdownOpen) {
        calculateDropdownPosition();
      }
    };
    
    const handleScroll = () => {
      if (isDropdownOpen) {
        calculateDropdownPosition();
      }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isDropdownOpen, calculateDropdownPosition]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDropdownOpen &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDropdownOpen]);

  // Early return AFTER all hooks
  if (!user || !userProfile) {
    return null;
  }

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  const getInitials = (displayName: string | null) => {
    if (!displayName) return 'U';
    return displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const toggleDropdown = () => {
    if (!isDropdownOpen) {
      calculateDropdownPosition();
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        disabled={loading}
        aria-expanded={isDropdownOpen}
        aria-haspopup="menu"
      >
        <div className="relative">
          {userProfile.photoURL ? (
            <img
              src={userProfile.photoURL}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
              {getInitials(userProfile.displayName)}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>
        
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-32">
            {userProfile.displayName || 'User'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
            {userProfile.email}
          </p>
        </div>
        
        <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-30 bg-black/20 dark:bg-black/40 backdrop-blur-sm" 
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown */}
          <div 
            ref={dropdownRef}
            className="fixed z-40 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200"
            style={{
              top: dropdownPosition.top !== 'auto' ? dropdownPosition.top : undefined,
              bottom: dropdownPosition.bottom !== 'auto' ? dropdownPosition.bottom : undefined,
              left: dropdownPosition.left !== 'auto' ? dropdownPosition.left : undefined,
              right: dropdownPosition.right !== 'auto' ? dropdownPosition.right : undefined,
            }}
            role="menu"
            aria-orientation="vertical"
          >
            {/* Profile Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {userProfile.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-medium ring-2 ring-gray-200 dark:ring-gray-700">
                    {getInitials(userProfile.displayName)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {userProfile.displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {userProfile.email}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Crown className="w-3 h-3 text-yellow-500 dark:text-yellow-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-300">Free Plan</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Usage Overview</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mx-auto mb-1">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Prompts</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {userProfile.usage?.promptsGenerated || 0}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full mx-auto mb-1">
                    <Image className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Images</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {userProfile.usage?.imagesCreated || 0}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full mx-auto mb-1">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Social</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {userProfile.usage?.socialPostsCreated || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button 
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                role="menuitem"
              >
                <User className="w-4 h-4" />
                View Profile
              </button>
              <button 
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                role="menuitem"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>

            {/* Logout */}
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start gap-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus:ring-red-500"
                disabled={loading}
                role="menuitem"
              >
                <LogOut className="w-4 h-4" />
                {loading ? 'Signing out...' : 'Sign out'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;