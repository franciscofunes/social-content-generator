"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Wand2, 
  Copy, 
  RefreshCw,
  Lightbulb,
  Target,
  Palette,
  Camera,
  Sparkles,
  Download,
  Heart,
  Zap,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SavedPrompt } from '@/lib/types/prompt';
import { 
  savePromptToFirestore, 
  loadPromptsFromFirestore, 
  deletePromptFromFirestore 
} from '@/lib/firestore-client';

const ideaCategories = [
  {
    id: 'photography',
    name: 'Photography',
    icon: Camera
  },
  {
    id: 'art',
    name: 'Digital Art',
    icon: Palette
  },
  {
    id: 'business',
    name: 'Business & Professional',
    icon: Target
  },
  {
    id: 'creative',
    name: 'Creative & Artistic',
    icon: Sparkles
  }
];

const tipCategories = [
  {
    title: 'Be Specific',
    description: 'Use detailed descriptions instead of generic terms',
    examples: ['Instead of "nice", use "elegant", "sophisticated", or "charming"']
  },
  {
    title: 'Include Technical Details',
    description: 'Add camera settings, lighting, and quality modifiers',
    examples: ['Add "shot with 85mm lens", "golden hour lighting", "shallow depth of field"']
  },
  {
    title: 'Use Artistic References',
    description: 'Reference art styles, artists, or movements',
    examples: ['"In the style of Ansel Adams", "Art Nouveau inspired", "Bauhaus design principles"']
  },
  {
    title: 'Specify Composition',
    description: 'Describe how elements should be arranged',
    examples: ['"Rule of thirds composition", "centered subject", "leading lines"']
  }
];

export default function PromptGenerator() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('photography');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // Load saved prompts when user is authenticated
  useEffect(() => {
    if (user) {
      loadSavedPrompts();
    } else {
      setSavedPrompts([]);
    }
  }, [user]);

  const loadSavedPrompts = async () => {
    if (!user) return;

    setLoadingPrompts(true);
    try {
      console.log('Loading prompts for user:', user.uid);
      const prompts = await loadPromptsFromFirestore(user.uid);
      console.log('Loaded prompts:', prompts.length);
      setSavedPrompts(prompts);
    } catch (error) {
      console.error('Error loading prompts:', error);
      toast.error('Failed to load saved prompts');
    } finally {
      setLoadingPrompts(false);
    }
  };

  const generatePrompt = async () => {
    if (!userInput.trim()) {
      toast.error('Please enter a description first');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: userInput.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const data = await response.json();
      setCurrentPrompt(data.prompt);
      toast.success('AI-enhanced prompt generated successfully!');
      
      // Update user stats if signed in
      if (user) {
        // TODO: Update user stats in Firebase
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast.error('Failed to generate prompt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied to clipboard!');
  };

  const savePrompt = async (prompt: string) => {
    if (!user) {
      toast.error('Please sign in to save prompts');
      return;
    }

    if (!prompt.trim()) {
      toast.error('Cannot save empty prompt');
      return;
    }

    // Check if prompt already exists
    const existingPrompt = savedPrompts.find(p => p.prompt === prompt.trim());
    if (existingPrompt) {
      toast.error('Prompt already saved');
      return;
    }

    try {
      console.log('Saving prompt for user:', user.uid);
      
      const savedPrompt = await savePromptToFirestore(prompt.trim(), user.uid);
      console.log('Prompt saved:', savedPrompt.id);
      
      // Add to local state
      setSavedPrompts(prev => [savedPrompt, ...prev]);
      toast.success('Prompt saved successfully!');
      
      // Update user stats if available
      if (user) {
        // TODO: Update user stats in Firebase (prompts generated count)
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save prompt');
    }
  };

  const removeSavedPrompt = async (promptId: string) => {
    if (!user) {
      toast.error('Please sign in to delete prompts');
      return;
    }

    try {
      console.log('Deleting prompt:', promptId);
      
      await deletePromptFromFirestore(promptId, user.uid);
      console.log('Prompt deleted:', promptId);

      // Remove from local state
      setSavedPrompts(prev => prev.filter(p => p.id !== promptId));
      toast.success('Prompt removed successfully!');
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete prompt');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex-shrink-0">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">AI Prompt Enhancer</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">Transform your ideas into optimized BRIA AI prompts</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Categories and Templates */}
          <div className="space-y-4 lg:space-y-6">
            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Categories</h3>
              <div className="space-y-2">
                {ideaCategories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.id;
                  return (
                    <Button
                      key={category.id}
                      variant={isSelected ? "default" : "ghost"}
                      className="w-full justify-start text-left min-w-0"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="text-sm sm:text-base truncate">{category.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Example Ideas */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Example Ideas</h3>
              <div className="space-y-2 sm:space-y-3">
                {ideaCategories.map((category, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => setUserInput(`${category.name.toLowerCase()} scene`)}>
                    <div className="flex items-start gap-2">
                      <category.icon className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1 truncate">
                          {category.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed break-words">
                          Click to start with a {category.name.toLowerCase()} idea
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-0 mb-3 sm:mb-4 min-w-0"
                onClick={() => setShowTips(!showTips)}
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate flex-1 text-left">💡 Pro Tips</h3>
                <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ml-2" />
              </Button>
              
              {showTips && (
                <div className="space-y-3 sm:space-y-4">
                  {tipCategories.map((tip, index) => (
                    <div key={index} className="border-l-4 border-purple-500 pl-3 sm:pl-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm break-words">{tip.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 leading-relaxed break-words">{tip.description}</p>
                      {tip.examples.map((example, i) => (
                        <p key={i} className="text-xs text-purple-600 dark:text-purple-400 italic leading-relaxed break-words">
                          {example}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Middle Column - Generator */}
          <div className="space-y-4 lg:space-y-6 min-w-0">
            {/* User Input */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Describe Your Image</h3>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter a simple description of what you want to create... For example: 'A professional office worker using safety equipment' or 'Modern workplace with good lighting'"
                className="w-full h-24 sm:h-32 p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm leading-relaxed"
                rows={4}
              />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <span>{userInput.length} characters</span>
                <span>{userInput.split(' ').filter(w => w.length > 0).length} words</span>
              </div>
              
              <div className="mt-4">
                <Button
                  onClick={generatePrompt}
                  disabled={isGenerating || !userInput.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-sm sm:text-base"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Enhance with AI'}</span>
                  <span className="sm:hidden">{isGenerating ? 'Generating' : 'Enhance'}</span>
                </Button>
              </div>
            </div>

            {/* Enhanced Prompt Output */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI-Enhanced Prompt</h3>
              
              {currentPrompt ? (
                <>
                  <div className="mb-4">
                    <textarea
                      value={currentPrompt}
                      onChange={(e) => setCurrentPrompt(e.target.value)}
                      className="w-full h-32 sm:h-40 p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm leading-relaxed"
                      rows={8}
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <span>{currentPrompt.length} characters</span>
                      <span>{currentPrompt.split(' ').filter(w => w.length > 0).length} words</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => copyPrompt(currentPrompt)}
                        variant="outline"
                        className="flex-1 min-w-0 text-sm sm:text-base"
                      >
                        <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">Copy</span>
                      </Button>
                      <Button
                        onClick={() => savePrompt(currentPrompt)}
                        variant="outline"
                        className="flex-1 min-w-0 text-sm sm:text-base"
                        disabled={!user}
                        title={!user ? 'Please sign in to save prompts' : 'Save this prompt'}
                      >
                        <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">Save</span>
                      </Button>
                    </div>
                    <Button
                      onClick={() => {
                        const encodedPrompt = encodeURIComponent(currentPrompt);
                        window.open(`/images?prompt=${encodedPrompt}`, '_blank');
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                    >
                      <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Create Image</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <MessageSquare className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">No enhanced prompt yet</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 max-w-md mx-auto px-4">
                    Enter a description above and click "Enhance with AI" to generate an optimized prompt for BRIA AI
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 sm:p-6 border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 text-sm sm:text-base">Quick Actions</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800 text-xs sm:text-sm min-w-0"
                  onClick={() => {
                    if (currentPrompt) {
                      const encodedPrompt = encodeURIComponent(currentPrompt);
                      window.open(`/images?prompt=${encodedPrompt}`, '_blank');
                    } else {
                      window.open('/images', '_blank');
                    }
                  }}
                >
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Create Image</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800 text-xs sm:text-sm min-w-0"
                  onClick={() => window.open('/social', '_blank')}
                >
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Social Post</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800 text-xs sm:text-sm min-w-0 sm:col-span-2 lg:col-span-1 xl:col-span-2"
                  onClick={() => window.open('/gallery', '_blank')}
                >
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Gallery</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Saved Prompts */}
          <div className="space-y-4 lg:space-y-6 lg:col-span-1 xl:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Saved Prompts</h3>
              
              {loadingPrompts ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600 dark:text-gray-400">Loading saved prompts...</p>
                </div>
              ) : savedPrompts.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No saved prompts yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {user ? 'Save prompts you like to use them later' : 'Sign in to save prompts'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                  {savedPrompts.map((promptObj) => (
                    <div
                      key={promptObj.id}
                      className="p-2 sm:p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <p className="text-xs sm:text-sm text-gray-900 dark:text-white mb-2 line-clamp-3 leading-relaxed break-words">
                        {promptObj.prompt}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate order-2 sm:order-1">
                          {promptObj.createdAt ? new Date(promptObj.createdAt).toLocaleDateString() : ''}
                        </div>
                        <div className="flex items-center gap-1 order-1 sm:order-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setCurrentPrompt(promptObj.prompt)}
                            className="text-xs px-1 sm:px-2 py-1 h-6 sm:h-7 flex-1 sm:flex-none"
                          >
                            Use
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyPrompt(promptObj.prompt)}
                            className="text-xs px-1 sm:px-2 py-1 h-6 sm:h-7 flex-1 sm:flex-none"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeSavedPrompt(promptObj.id)}
                            className="text-xs px-1 sm:px-2 py-1 h-6 sm:h-7 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-1 sm:flex-none"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}