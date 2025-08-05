'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import ShareButtonGroup from '@/components/ui/ShareButtonGroup';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Trash2, 
  Edit3,
  Calendar,
  Hash,
  Globe,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  loadSocialPostsFromFirestore, 
  deleteSocialPostFromFirestore,
  exportSocialPostsData,
  getSocialPostsStats,
  SocialPost,
  SocialPostsFilters 
} from '@/lib/services/social-posts';
import { SUPPORTED_LANGUAGES } from '@/lib/utils/language';
import { toast } from 'react-hot-toast';

interface PostHistoryProps {
  onEditPost?: (post: SocialPost) => void;
  className?: string;
}

const PostHistory: React.FC<PostHistoryProps> = ({ 
  onEditPost,
  className = '' 
}) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SocialPostsFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  // Load posts on component mount
  useEffect(() => {
    if (user) {
      loadPosts();
      loadStats();
    }
  }, [user]);

  // Apply filters whenever posts, search query, or filters change
  useEffect(() => {
    applyFilters();
  }, [posts, searchQuery, filters]);

  const loadPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const loadedPosts = await loadSocialPostsFromFirestore(user.uid, filters, 100);
      setPosts(loadedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load post history');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    
    try {
      const statsData = await getSocialPostsStats(user.uid);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...posts];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.prompt.toLowerCase().includes(query) ||
        Object.values(post.generatedContent).some(content => 
          content.text.toLowerCase().includes(query)
        )
      );
    }

    // Platform filter
    if (filters.platform) {
      filtered = filtered.filter(post => 
        post.settings.selectedPlatforms.includes(filters.platform!)
      );
    }

    // Content type filter
    if (filters.contentType) {
      filtered = filtered.filter(post => 
        post.settings.contentType === filters.contentType
      );
    }

    // Language filter
    if (filters.language) {
      filtered = filtered.filter(post => {
        const language = post.settings.languageOverride || post.settings.detectedLanguage;
        return language === filters.language;
      });
    }

    // Date range filters
    if (filters.dateFrom) {
      filtered = filtered.filter(post => 
        new Date(post.createdAt) >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(post => 
        new Date(post.createdAt) <= filters.dateTo!
      );
    }

    setFilteredPosts(filtered);
  };

  const handleDelete = async (postId: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await deleteSocialPostFromFirestore(postId, user.uid);
      setPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    if (!user) return;
    
    setExporting(true);
    try {
      const data = await exportSocialPostsData(user.uid, format, filters);
      
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `social-posts-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Posts exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting posts:', error);
      toast.error('Failed to export posts');
    } finally {
      setExporting(false);
    }
  };

  const togglePostExpansion = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.nativeName || code;
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sign In Required</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please sign in to view your post history
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Post History</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('json')}
              disabled={exporting || filteredPosts.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={exporting || filteredPosts.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPosts}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.totalPosts}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Object.keys(stats.postsByPlatform).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Platforms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Object.keys(stats.postsByLanguage).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.recentActivity.reduce((sum: number, day: any) => sum + day.count, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Last 7 Days</div>
            </div>
          </div>
        )}

        {/* Search and filters */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {/* Platform filter */}
              <select
                value={filters.platform || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value || undefined }))}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Platforms</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter</option>
                <option value="facebook">Facebook</option>
                <option value="tiktok">TikTok</option>
              </select>

              {/* Content type filter */}
              <select
                value={filters.contentType || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, contentType: e.target.value || undefined }))}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="promotional">Promotional</option>
                <option value="educational">Educational</option>
                <option value="inspirational">Inspirational</option>
                <option value="behind-scenes">Behind the Scenes</option>
                <option value="user-generated">User Generated</option>
                <option value="trending">Trending</option>
              </select>

              {/* Language filter */}
              <select
                value={filters.language || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value || undefined }))}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Languages</option>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>

              {/* Date from */}
              <input
                type="date"
                value={filters.dateFrom?.toISOString().split('T')[0] || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  dateFrom: e.target.value ? new Date(e.target.value) : undefined 
                }))}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />

              {/* Clear filters */}
              <Button
                variant="outline"
                onClick={clearFilters}
                size="sm"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Posts list */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading post history...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {posts.length === 0 ? 'No Posts Yet' : 'No Matching Posts'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {posts.length === 0 
                ? 'Create your first social media post to see it here'
                : 'Try adjusting your search or filters'
              }
            </p>
          </div>
        ) : (
          filteredPosts.map(post => {
            const isExpanded = expandedPosts.has(post.id);
            const language = post.settings.languageOverride || post.settings.detectedLanguage;
            
            return (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Post header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()} at{' '}
                          {new Date(post.createdAt).toLocaleTimeString()}
                        </span>
                        <div className="flex items-center gap-1 ml-4">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {getLanguageName(language)}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {post.prompt}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded">
                          {post.settings.contentType}
                        </span>
                        <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded">
                          {post.settings.tone}
                        </span>
                        {post.settings.selectedPlatforms.map(platform => (
                          <span
                            key={platform}
                            className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePostExpansion(post.id)}
                      >
                        {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      
                      {onEditPost && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditPost(post)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Post content (expanded view) */}
                {isExpanded && (
                  <div className="p-6 space-y-6">
                    {Object.entries(post.generatedContent).map(([platform, content]) => (
                      <div key={platform} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 border-b border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                            {platform}
                          </h4>
                        </div>
                        
                        <div className="p-4">
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                            <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-sans">
                              {content.text}
                            </pre>
                          </div>
                          
                          {content.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {content.hashtags.map((hashtag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded"
                                >
                                  {hashtag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <ShareButtonGroup
                            text={content.text}
                            hashtags={content.hashtags}
                            platforms={[platform]}
                            layout="horizontal"
                            size="sm"
                            showLabels={false}
                            showCopyButton={true}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PostHistory;