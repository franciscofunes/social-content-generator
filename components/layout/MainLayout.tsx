"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import UserProfile from '@/components/auth/UserProfile';
import LoginModal from '@/components/auth/LoginModal';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { 
  Menu, 
  X, 
  Home, 
  MessageSquare, 
  Image, 
  Share2, 
  ImageIcon,
  Settings,
  Moon,
  Sun,
  Sparkles,
  Shield,
  FileText,
  HelpCircle,
  Mail,
  Lightbulb,
  Bug
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage?: 'dashboard' | 'prompts' | 'images' | 'social' | 'gallery' | 'settings';
}

export default function MainLayout({ children, currentPage = 'dashboard' }: MainLayoutProps) {
  const { user, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, id: 'dashboard' },
    { name: 'Prompt Generator', href: '/prompts', icon: MessageSquare, id: 'prompts' },
    { name: 'Image Creator', href: '/images', icon: Image, id: 'images' },
    { name: 'Social Posts', href: '/social', icon: Share2, id: 'social' },
    { name: 'Gallery', href: '/gallery', icon: ImageIcon, id: 'gallery' },
  ];

  const supportLinks = [
    { name: 'Help Center', href: '/support/help', icon: HelpCircle },
    { name: 'Contact Us', href: '/support/contact', icon: Mail },
    { name: 'Feature Requests', href: '/support/features', icon: Lightbulb },
    { name: 'Bug Reports', href: '/support/bugs', icon: Bug },
  ];

  const legalLinks = [
    { name: 'Terms & Conditions', href: '/terms', icon: FileText },
    { name: 'Privacy Policy', href: '/privacy', icon: Shield },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      {/* Mobile header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="p-2"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Content Generator</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="p-2"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {user ? (
              <UserProfile />
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLoginModal(true)}
                className="text-xs"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600/75" onClick={closeSidebar} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl">
            <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-gray-900 dark:text-white">Content Generator</span>
              </div>
              <Button variant="ghost" size="sm" onClick={closeSidebar}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="mt-8 px-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={closeSidebar}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </a>
                );
              })}
              
              {/* Support Section */}
              <div className="pt-6">
                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Support
                </h3>
                {supportLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={closeSidebar}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </a>
                  );
                })}
              </div>

              {/* Legal Section */}
              <div className="pt-6">
                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Legal
                </h3>
                {legalLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={closeSidebar}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </a>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop layout */}
      <div className="lg:flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Content Generator</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Creation</p>
              </div>
            </div>

            {/* User section */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              {user ? (
                <UserProfile />
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Save your work</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLoginModal(true)}
                    className="w-full"
                  >
                    Sign In with Google
                  </Button>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </a>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2"
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span className="text-xs">{darkMode ? 'Light' : 'Dark'}</span>
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
          <main className="flex-1 pb-24 lg:pb-0">
            {children}
          </main>
          
          {/* Footer - hidden on mobile, shown on desktop */}
          <div className="hidden lg:block">
            <Footer />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          title="Welcome to Content Generator"
          subtitle="Sign in to save your work and access all features"
        />
      )}
    </div>
  );
}