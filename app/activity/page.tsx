"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRecentActivity, RecentActivityItem } from '@/lib/dashboard-stats';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Share2, 
  Clock, 
  Filter,
  ChevronLeft,
  Calendar,
  Search,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function ActivityPage() {
  const { user } = useAuth();
  const [activity, setActivity] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    const loadActivity = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Load more items for the full activity view
        const activityData = await getRecentActivity(user.uid, 50);
        setActivity(activityData);
      } catch (error) {
        console.error('Error loading activity:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [user]);

  // Helper function to get the right icon component
  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare': return MessageSquare;
      case 'Image': return ImageIcon;
      case 'Share2': return Share2;
      default: return Clock;
    }
  };

  // Helper function to get activity type colors
  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'prompt': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      case 'image': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'social': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  // Filter and search activity
  const filteredActivity = activity
    .filter(item => {
      // Filter by type
      if (filter !== 'all' && item.type !== filter) return false;
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // Format date with relative time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Activity', count: activity.length },
    { value: 'prompt', label: 'Prompts', count: activity.filter(item => item.type === 'prompt').length },
    { value: 'image', label: 'Images', count: activity.filter(item => item.type === 'image').length },
    { value: 'social', label: 'Social Posts', count: activity.filter(item => item.type === 'social').length },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Recent Activity</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your complete activity history across all creative tools
            </p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search activity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                {filterOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filter === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(option.value)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-3 w-3" />
                    {option.label}
                    <span className="bg-gray-200 dark:bg-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {option.count}
                    </span>
                  </Button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Activity List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading activity...</span>
              </div>
            ) : filteredActivity.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredActivity.map((item, index) => {
                  const Icon = getActivityIcon(item.icon);
                  const colorClasses = getActivityTypeColor(item.type);
                  
                  return (
                    <div
                      key={item.id}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {item.title}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 ml-4">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(item.createdAt)}</span>
                              <span className="capitalize bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                                {item.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchTerm || filter !== 'all' ? 'No matching activity found' : 'No activity yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Start creating content to see your activity here'
                  }
                </p>
                {(!searchTerm && filter === 'all') && (
                  <Link href="/prompts">
                    <Button>
                      Create Your First Prompt
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Results Summary */}
          {!loading && filteredActivity.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredActivity.length} of {activity.length} activities
              {filter !== 'all' && ` • Filtered by: ${filterOptions.find(f => f.value === filter)?.label}`}
              {searchTerm && ` • Search: "${searchTerm}"`}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}