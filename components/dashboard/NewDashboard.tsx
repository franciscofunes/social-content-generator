"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Share2, 
  TrendingUp, 
  Clock, 
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  Users
} from 'lucide-react';

export default function NewDashboard() {
  const { user, userProfile } = useAuth();

  const features = [
    {
      title: 'Smart Prompt Generator',
      description: 'Create optimized prompts for AI image generation with expert templates and suggestions.',
      icon: MessageSquare,
      href: '/prompts',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'AI Image Creator',
      description: 'Generate professional images with advanced prompt building and style customization.',
      icon: ImageIcon,
      href: '/images',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Social Media Posts',
      description: 'Create engaging social media content for multiple platforms with AI assistance.',
      icon: Share2,
      href: '/social',
      color: 'bg-green-500',
      lightColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    }
  ];

  const stats = [
    { label: 'Prompts Generated', value: userProfile?.usage?.promptsGenerated || 0, icon: MessageSquare },
    { label: 'Images Created', value: userProfile?.usage?.imagesCreated || 0, icon: ImageIcon },
    { label: 'Social Posts', value: userProfile?.usage?.socialPostsCreated || 0, icon: Share2 },
  ];

  const quickActions = [
    { title: 'Generate Image Prompt', description: 'Quick prompt creation', href: '/prompts', icon: Zap },
    { title: 'Create Social Post', description: 'Multi-platform content', href: '/social', icon: Target },
    { title: 'Browse Gallery', description: 'View your creations', href: '/gallery', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900">
        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Welcome to Your{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Creative Studio
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {user 
                ? `Welcome back, ${user.displayName}! Ready to create amazing content?`
                : 'Generate optimized prompts, create stunning images, and craft engaging social media content with AI.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8">
                Start Creating
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              {!user && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white/30 text-white hover:bg-white/10 font-semibold px-8"
                >
                  Sign In to Save Work
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Section */}
        {user && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={index} 
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Creative Tools</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer"
                  onClick={() => window.location.href = feature.href}
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.lightColor} mb-6`}>
                    <Icon className={`h-6 w-6 ${feature.textColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:gap-2 transition-all">
                    Get Started
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-start text-left hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                  onClick={() => window.location.href = action.href}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {action.title}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {action.description}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
            <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Recent Activity</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start creating content to see your recent activity here.
            </p>
            <Button onClick={() => window.location.href = '/prompts'}>
              Create Your First Prompt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}