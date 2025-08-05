"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Share2, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Facebook,
  Hash,
  AtSign,
  Type,
  Image as ImageIcon,
  Copy,
  Download,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const platforms = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    limits: { caption: 2200, hashtags: 30 },
    features: ['Stories', 'Reels', 'Posts', 'IGTV']
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-600',
    limits: { caption: 3000, hashtags: 10 },
    features: ['Professional', 'Articles', 'Updates', 'Events']
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-blue-400',
    limits: { caption: 280, hashtags: 5 },
    features: ['Tweets', 'Threads', 'Spaces', 'Moments']
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600',
    limits: { caption: 63206, hashtags: 20 },
    features: ['Posts', 'Stories', 'Events', 'Pages']
  }
];

const contentTypes = [
  { id: 'promotional', name: 'Promotional', description: 'Product launches, sales, offers' },
  { id: 'educational', name: 'Educational', description: 'Tips, tutorials, how-tos' },
  { id: 'inspirational', name: 'Inspirational', description: 'Quotes, motivation, success stories' },
  { id: 'behind-scenes', name: 'Behind the Scenes', description: 'Company culture, processes' },
  { id: 'user-generated', name: 'User Generated', description: 'Customer stories, testimonials' },
  { id: 'trending', name: 'Trending', description: 'Current events, viral topics' }
];

const tones = [
  'Professional', 'Casual', 'Friendly', 'Authoritative', 'Humorous', 
  'Inspiring', 'Urgent', 'Conversational', 'Expert', 'Playful'
];

const hashtagSuggestions = {
  business: ['#business', '#entrepreneur', '#success', '#leadership', '#innovation'],
  tech: ['#technology', '#AI', '#digital', '#future', '#innovation'],
  lifestyle: ['#lifestyle', '#wellness', '#mindfulness', '#health', '#happiness'],
  marketing: ['#marketing', '#digitalmarketing', '#branding', '#socialmedia', '#content'],
  education: ['#education', '#learning', '#knowledge', '#skills', '#growth']
};

export default function SocialCreator() {
  const { user } = useAuth();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [contentType, setContentType] = useState('promotional');
  const [tone, setTone] = useState('professional');
  const [topic, setTopic] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [generatedPosts, setGeneratedPosts] = useState<{[key: string]: any}>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const generatePosts = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic for your post');
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPosts: {[key: string]: any} = {};
      
      selectedPlatforms.forEach(platformId => {
        const platform = platforms.find(p => p.id === platformId);
        if (!platform) return;

        // Generate mock content based on platform and settings
        const content = generateMockContent(platformId, topic, contentType, tone, platform.limits);
        newPosts[platformId] = content;
      });
      
      setGeneratedPosts(newPosts);
      toast.success('Posts generated successfully!');
      
      // Update user stats if signed in
      if (user) {
        // TODO: Update user stats in Firebase
      }
    } catch (error) {
      console.error('Error generating posts:', error);
      toast.error('Failed to generate posts. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockContent = (platformId: string, topic: string, type: string, tone: string, limits: any) => {
    // Mock content generation based on platform and settings
    const baseContent = `🚀 Exciting news about ${topic}! `;
    
    let content = '';
    let hashtags = ['#innovation', '#business', '#success'];
    
    switch (platformId) {
      case 'instagram':
        content = baseContent + `This is a game-changer for our community! 💪\n\nWhat are your thoughts? Let us know in the comments below! 👇\n\n#${topic.replace(/\s+/g, '')} #community #inspiration`;
        break;
      case 'linkedin':
        content = baseContent + `I'm excited to share some insights about ${topic} and how it's transforming our industry.\n\nKey takeaways:\n• Innovation drives growth\n• Community matters\n• Success is a journey\n\nWhat's your experience with ${topic}? I'd love to hear your thoughts in the comments.\n\n#${topic.replace(/\s+/g, '')} #professional #growth`;
        break;
      case 'twitter':
        content = `🚀 ${topic} is changing the game! Here's why it matters for your business 👇 #${topic.replace(/\s+/g, '')} #innovation`;
        break;
      case 'facebook':
        content = baseContent + `We've been working on something special and can't wait to share it with you all!\n\n${topic} represents our commitment to innovation and excellence. Join the conversation and let us know what you think!\n\n#${topic.replace(/\s+/g, '')} #community #innovation`;
        break;
    }
    
    return {
      content,
      hashtags,
      characterCount: content.length,
      wordCount: content.split(' ').length,
      platform: platforms.find(p => p.id === platformId)
    };
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Content copied to clipboard!');
  };

  const addHashtag = (hashtag: string) => {
    if (!selectedHashtags.includes(hashtag)) {
      setSelectedHashtags([...selectedHashtags, hashtag]);
    }
  };

  const removeHashtag = (hashtag: string) => {
    setSelectedHashtags(selectedHashtags.filter(h => h !== hashtag));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl">
              <Share2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Social Media Creator</h1>
              <p className="text-gray-600 dark:text-gray-400">Create engaging posts for multiple platforms</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Platform Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Platforms</h3>
              <div className="space-y-3">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <Button
                      key={platform.id}
                      variant={isSelected ? "default" : "outline"}
                      className={`w-full justify-start h-auto p-4 ${isSelected ? platform.color : ''}`}
                      onClick={() => togglePlatform(platform.id)}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">{platform.name}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {platform.limits.caption} chars • {platform.limits.hashtags} hashtags
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Content Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content Settings</h3>
              
              <div className="space-y-4">
                {/* Topic */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic/Subject
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., New product launch, Industry insights..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Content Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content Type
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {contentTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {contentTypes.find(t => t.id === contentType)?.description}
                  </p>
                </div>

                {/* Tone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {tones.map((t) => (
                      <option key={t} value={t.toLowerCase()}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Custom Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Instructions (Optional)
                  </label>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Any specific requirements or context..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none h-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <Button
                onClick={generatePosts}
                disabled={isGenerating || !topic.trim() || selectedPlatforms.length === 0}
                className="w-full mt-6 bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Posts
                  </>
                )}
              </Button>
            </div>

            {/* Hashtag Suggestions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hashtag Suggestions</h3>
              <div className="space-y-3">
                {Object.entries(hashtagSuggestions).map(([category, tags]) => (
                  <div key={category}>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Button
                          key={tag}
                          variant="outline"
                          size="sm"
                          className="text-xs h-6 px-2"
                          onClick={() => addHashtag(tag)}
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Generated Posts */}
          <div className="lg:col-span-2 space-y-6">
            {Object.keys(generatedPosts).length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Share2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Generate Your Social Posts</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Configure your settings and click "Generate Posts" to create platform-optimized content
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">Optimized Content</p>
                  </div>
                  <div className="text-center">
                    <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">Multi-Platform</p>
                  </div>
                  <div className="text-center">
                    <Hash className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">Smart Hashtags</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">Ready to Post</p>
                  </div>
                </div>
              </div>
            ) : (
              Object.entries(generatedPosts).map(([platformId, post]: [string, any]) => {
                const Icon = post.platform.icon;
                return (
                  <div
                    key={platformId}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Platform Header */}
                    <div className={`${post.platform.color} p-4`}>
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                          <Icon className="h-6 w-6" />
                          <div>
                            <h3 className="font-semibold">{post.platform.name}</h3>
                            <p className="text-sm opacity-90">
                              {post.characterCount}/{post.platform.limits.caption} characters
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                            onClick={() => copyContent(post.content)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                        <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-sans">
                          {post.content}
                        </pre>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <span>{post.wordCount} words</span>
                        <span>{post.hashtags.length} hashtags</span>
                        <span>
                          {post.characterCount <= post.platform.limits.caption ? '✅' : '⚠️'} 
                          {post.characterCount <= post.platform.limits.caption ? ' Within limit' : ' Over limit'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => copyContent(post.content)}
                          className="flex-1"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Content
                        </Button>
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}