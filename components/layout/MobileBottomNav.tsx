"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  MessageSquare, 
  Image, 
  Share2, 
  ImageIcon,
  Plus
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  id: string;
}

const navigation: NavItem[] = [
  { name: 'Home', href: '/dashboard', icon: Home, id: 'dashboard' },
  { name: 'Prompts', href: '/prompts', icon: MessageSquare, id: 'prompts' },
  { name: 'Create', href: '/images', icon: Plus, id: 'images' },
  { name: 'Social', href: '/social', icon: Share2, id: 'social' },
  { name: 'Gallery', href: '/gallery', icon: ImageIcon, id: 'gallery' },
];

export default function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const getCurrentPage = () => {
    if (pathname === '/dashboard') return 'dashboard';
    if (pathname === '/prompts') return 'prompts';
    if (pathname === '/images') return 'images';
    if (pathname === '/social') return 'social';
    if (pathname === '/gallery') return 'gallery';
    return 'dashboard';
  };

  const currentPage = getCurrentPage();

  const handleNavigation = (href: string, id: string) => {
    router.push(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Background with blur effect */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isCreateButton = item.id === 'images';
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.href, item.id)}
                className={`
                  relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 min-h-[60px]
                  ${isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                  ${isCreateButton && isActive 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 scale-110 shadow-lg' 
                    : isCreateButton
                    ? 'bg-blue-600 text-white hover:bg-blue-700 scale-110 shadow-lg'
                    : isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && !isCreateButton && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
                
                {/* Icon */}
                <Icon 
                  className={`
                    h-5 w-5 mb-1
                    ${isCreateButton ? 'h-6 w-6' : 'h-5 w-5'}
                  `} 
                />
                
                {/* Label */}
                <span 
                  className={`
                    text-xs font-medium leading-none
                    ${isActive && !isCreateButton ? 'text-blue-600 dark:text-blue-400' : ''}
                    ${isCreateButton ? 'text-white' : ''}
                  `}
                >
                  {item.name}
                </span>

                {/* Badge for active state (optional) */}
                {isActive && !isCreateButton && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full opacity-75" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Safe area padding for devices with home indicator */}
      <div className="h-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg" />
    </div>
  );
}