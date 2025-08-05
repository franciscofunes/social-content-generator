"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import LanguageSelector from '@/components/ui/LanguageSelector';
import ShareButtonGroup from '@/components/ui/ShareButtonGroup';
import PostHistory from '@/components/social/PostHistory';
import { 
  Share2, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Facebook,
  Video,
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
  RefreshCw,
  History,
  Plus,
  Minus,
  Globe,
  Zap,
  Wand2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { detectLanguage } from '@/lib/utils/language';
import { saveSocialPostToFirestore, SocialPost } from '@/lib/services/social-posts';

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
    name: 'Twitter/X',
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
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: Video,
    color: 'bg-black',
    limits: { caption: 300, hashtags: 8 },
    features: ['Videos', 'Sounds', 'Effects', 'Challenges']
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
  
  // State management
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [contentType, setContentType] = useState('promotional');
  const [tone, setTone] = useState('professional');
  const [topic, setTopic] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [generatedPosts, setGeneratedPosts] = useState<{[key: string]: any}>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  
  // Language detection and selection
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  const [languageOverride, setLanguageOverride] = useState<string | undefined>();
  
  // UI state
  const [currentTab, setCurrentTab] = useState<'create' | 'history'>('create');
  const [isSaving, setIsSaving] = useState(false);
  
  // Enhancement state
  const [isEnhancingTopic, setIsEnhancingTopic] = useState(false);
  const [isEnhancingInstructions, setIsEnhancingInstructions] = useState(false);

  // Auto-detect language when topic changes
  useEffect(() => {
    if (topic.trim()) {
      const detected = detectLanguage(topic);
      setDetectedLanguage(detected);
    }
  }, [topic]);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => {
      const newPlatforms = prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId];
      
      // Remove generated content for unselected platforms
      if (!prev.includes(platformId)) {
        // Platform was added, no need to remove content
        return newPlatforms;
      } else {
        // Platform was removed, clean up generated content
        setGeneratedPosts(prevPosts => {
          const newPosts = { ...prevPosts };
          delete newPosts[platformId];
          return newPosts;
        });
        return newPlatforms;
      }
    });
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
      // Generate content using API route
      const response = await fetch('/api/generate-social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          platforms: selectedPlatforms,
          contentType,
          tone,
          customInstructions: customInstructions.trim() || undefined,
          languageOverride,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate social content');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.details || 'Failed to generate content');
      }

      const generatedContent = result.data.generatedContent;
      
      // Transform to match expected format
      const newPosts: {[key: string]: any} = {};
      
      selectedPlatforms.forEach(platformId => {
        const platform = platforms.find(p => p.id === platformId);
        if (!platform || !generatedContent[platformId]) return;

        const content = generatedContent[platformId];
        newPosts[platformId] = {
          content: content.text,
          hashtags: content.hashtags,
          characterCount: content.text.length,
          wordCount: content.text.split(' ').length,
          platform
        };
      });
      
      setGeneratedPosts(newPosts);
      toast.success('Posts generated successfully!');
      
      // Auto-save if user is signed in
      if (user) {
        await saveGeneratedPosts(generatedContent);
      }
    } catch (error) {
      console.error('Error generating posts:', error);
      
      if (error instanceof Error && error.message.includes('GEMINI_API_KEY')) {
        toast.error('Gemini API key not configured. Using fallback content generation. Check console for setup instructions.');
      } else {
        toast.error('Failed to generate posts. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const saveGeneratedPosts = async (generatedContent: { [platform: string]: { text: string; hashtags: string[] } }) => {
    if (!user || !topic.trim()) return;

    setIsSaving(true);
    try {
      await saveSocialPostToFirestore({
        prompt: topic.trim(),
        userId: user.uid,
        generatedContent,
        settings: {
          contentType,
          tone,
          customInstructions: customInstructions.trim() || undefined,
          detectedLanguage,
          languageOverride: languageOverride || null,
          selectedPlatforms
        }
      });
      
      toast.success('Posts saved to history!');
    } catch (error) {
      console.error('Error saving posts:', error);
      toast.error('Failed to save posts to history');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditPost = (post: SocialPost) => {
    // Load post data into the form
    setTopic(post.prompt);
    setContentType(post.settings.contentType);
    setTone(post.settings.tone);
    setCustomInstructions(post.settings.customInstructions || '');
    setSelectedPlatforms(post.settings.selectedPlatforms);
    setDetectedLanguage(post.settings.detectedLanguage);
    setLanguageOverride(post.settings.languageOverride);
    
    // Transform content back to expected format
    const transformedPosts: {[key: string]: any} = {};
    Object.entries(post.generatedContent).forEach(([platform, content]) => {
      const platformData = platforms.find(p => p.id === platform);
      if (platformData) {
        transformedPosts[platform] = {
          content: content.text,
          hashtags: content.hashtags,
          characterCount: content.text.length,
          wordCount: content.text.split(' ').length,
          platform: platformData
        };
      }
    });
    
    setGeneratedPosts(transformedPosts);
    setCurrentTab('create');
    toast.success('Post loaded for editing!');
  };

  function addHashtag(tag: string): void {
    setSelectedHashtags(prev => {
      if (!prev.includes(tag)) {
        return [...prev, tag];
      }
      return prev;
    });
    toast.success(`Hashtag "${tag}" added!`);
  }

  const enhanceTopic = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic first');
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    setIsEnhancingTopic(true);
    
    try {
      const response = await fetch('/api/enhance-input', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: topic,
          platform: selectedPlatforms[0], // Use the first selected platform for enhancement
          inputType: 'topic'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance topic');
      }

      const result = await response.json();
      setTopic(result.enhancedInput);
      toast.success('Topic enhanced successfully!');
    } catch (error) {
      console.error('Error enhancing topic:', error);
      toast.error('Failed to enhance topic. Please try again.');
    } finally {
      setIsEnhancingTopic(false);
    }
  };

  const enhanceInstructions = async () => {
    if (!customInstructions.trim()) {
      toast.error('Please enter instructions first');
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    setIsEnhancingInstructions(true);
    
    try {
      const response = await fetch('/api/enhance-input', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: customInstructions,
          platform: selectedPlatforms[0], // Use the first selected platform for enhancement
          inputType: 'instructions'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance instructions');
      }

      const result = await response.json();
      setCustomInstructions(result.enhancedInput);
      toast.success('Instructions enhanced successfully!');
    } catch (error) {
      console.error('Error enhancing instructions:', error);
      toast.error('Failed to enhance instructions. Please try again.');
    } finally {
      setIsEnhancingInstructions(false);
    }
  };

  // Legacy functions removed - using new enhanced functionality

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl">
                <Share2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Social Media Creator</h1>
                <p className="text-gray-600 dark:text-gray-400">Create engaging posts for multiple platforms with AI</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
              <Button
                variant={currentTab === 'create' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentTab('create')}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Create
              </Button>
              <Button
                variant={currentTab === 'history' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentTab('history')}
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                History
              </Button>
            </div>
          </div>
        </div>

        {/* Content based on current tab */}
        {currentTab === 'history' ? (
          <PostHistory onEditPost={handleEditPost} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Platform Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Select Platforms
              </h3>
              <div className="space-y-3">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <div key={platform.id} className="relative">
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        className={`w-full justify-start h-auto p-4 transition-all duration-200 ${
                          isSelected 
                            ? `${platform.color} text-white border-transparent transform scale-[1.02]` 
                            : 'hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        onClick={() => togglePlatform(platform.id)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <div className="text-left flex-1">
                            <div className="font-medium">{platform.name}</div>
                            <div className={`text-xs mt-1 ${isSelected ? 'opacity-90' : 'opacity-70'}`}>
                              Max {platform.limits.caption} chars • {platform.limits.hashtags} hashtags
                            </div>
                            <div className={`text-xs mt-1 ${isSelected ? 'opacity-75' : 'opacity-60'}`}>
                              {platform.features.slice(0, 2).join(', ')}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </Button>
                      
                      {/* Animation for selection */}
                      {isSelected && (
                        <div className="absolute inset-0 rounded-lg border-2 border-white/30 pointer-events-none animate-pulse"></div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {selectedPlatforms.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Selected: {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-300">
                    Content will be optimized for each platform's audience and format
                  </div>
                </div>
              )}
            </div>

            {/* Content Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Type className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Content Settings
              </h3>
              
              <div className="space-y-4">
                {/* Topic */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Topic/Subject
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={enhanceTopic}
                      disabled={isEnhancingTopic || !topic.trim() || selectedPlatforms.length === 0}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                    >
                      {isEnhancingTopic ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4 mr-1" />
                      )}
                      {isEnhancingTopic ? 'Enhancing...' : 'Enhance with AI'}
                    </Button>
                  </div>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Describe what you want to post about... The more detail, the better!"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none h-20"
                  />
                  {topic.trim() && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Globe className="h-3 w-3" />
                      <span>Detected language: {detectedLanguage}</span>
                    </div>
                  )}
                </div>

                {/* Language Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content Language
                  </label>
                  <LanguageSelector
                    selectedLanguage={languageOverride}
                    detectedLanguage={detectedLanguage}
                    onLanguageChange={setLanguageOverride}
                    disabled={isGenerating}
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
                    Tone & Style
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Additional Instructions (Optional)
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={enhanceInstructions}
                      disabled={isEnhancingInstructions || !customInstructions.trim() || selectedPlatforms.length === 0}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                    >
                      {isEnhancingInstructions ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4 mr-1" />
                      )}
                      {isEnhancingInstructions ? 'Enhancing...' : 'Enhance with AI'}
                    </Button>
                  </div>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Any specific requirements, brand voice, target audience details..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none h-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <Button
                onClick={generatePosts}
                disabled={isGenerating || !topic.trim() || selectedPlatforms.length === 0}
                className="w-full mt-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-0"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Generate Posts ({selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''})
                  </>
                )}
              </Button>
              
              {(isGenerating || isSaving) && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {isGenerating && 'Creating platform-optimized content...'}
                    {isSaving && 'Saving to your history...'}
                  </div>
                </div>
              )}
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
              <div className="space-y-6">
                {Object.entries(generatedPosts).map(([platformId, post]: [string, any]) => {
                  const Icon = post.platform.icon;
                  const isOverLimit = post.characterCount > post.platform.limits.caption;
                  
                  return (
                    <div
                      key={platformId}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transform hover:scale-[1.01] transition-all duration-200"
                    >
                      {/* Platform Header */}
                      <div className={`${post.platform.color} p-6`}>
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                              <Icon className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{post.platform.name}</h3>
                              <div className="flex items-center gap-4 text-sm opacity-90 mt-1">
                                <span>{post.characterCount}/{post.platform.limits.caption} chars</span>
                                <span>{post.wordCount} words</span>
                                <span>{post.hashtags.length} hashtags</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {isOverLimit && (
                              <div className="px-2 py-1 bg-red-500/20 rounded text-xs font-medium">
                                Over Limit
                              </div>
                            )}
                            {!isOverLimit && (
                              <div className="px-2 py-1 bg-green-500/20 rounded text-xs font-medium">
                                ✓ Ready
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                          <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-sans leading-relaxed">
                            {post.content}
                          </pre>
                        </div>

                        {/* Hashtags */}
                        {post.hashtags.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {post.hashtags.map((hashtag: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded"
                                >
                                  {hashtag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Enhanced Share Actions */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-3">
                            <ShareButtonGroup
                              text={post.content}
                              hashtags={post.hashtags}
                              platforms={[platformId]}
                              layout="horizontal"
                              size="md"
                              showLabels={true}
                              showCopyButton={true}
                              showNativeShare={true}
                              className="justify-center"
                            />
                          </div>
                          
                          {/* Additional platform sharing options */}
                          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              Share to other platforms:
                            </div>
                            <ShareButtonGroup
                              text={post.content}
                              hashtags={post.hashtags}
                              platforms={['whatsapp', 'telegram']}
                              layout="horizontal"
                              size="sm"
                              showLabels={true}
                              showCopyButton={false}
                              showNativeShare={false}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Regenerate button */}
                {Object.keys(generatedPosts).length > 0 && (
                  <div className="text-center pt-4">
                    <Button
                      onClick={generatePosts}
                      disabled={isGenerating}
                      variant="outline"
                      size="lg"
                      className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                      Regenerate All Posts
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  );
}