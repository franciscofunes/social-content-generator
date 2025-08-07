"use client";

import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  User,
  Mail,
  FileText,
  Tag,
  TrendingUp,
  Star,
  Users
} from 'lucide-react';

interface FeatureRequestData {
  name: string;
  email: string;
  featureCategory: string;
  featureTitle: string;
  description: string;
  useCase: string;
  expectedBenefit: string;
  priority: 'low' | 'medium' | 'high';
  userType: string;
  willingnessToTest: boolean;
}

export default function FeatureRequests() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FeatureRequestData>({
    name: user?.displayName || '',
    email: user?.email || '',
    featureCategory: '',
    featureTitle: '',
    description: '',
    useCase: '',
    expectedBenefit: '',
    priority: 'medium',
    userType: '',
    willingnessToTest: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const featureCategories = [
    { value: 'prompt-generation', label: 'Prompt Generation' },
    { value: 'image-creation', label: 'Image Creation' },
    { value: 'social-media', label: 'Social Media Tools' },
    { value: 'ui-ux', label: 'User Interface & Experience' },
    { value: 'collaboration', label: 'Collaboration & Sharing' },
    { value: 'automation', label: 'Automation & Workflows' },
    { value: 'analytics', label: 'Analytics & Insights' },
    { value: 'integration', label: 'Third-party Integrations' },
    { value: 'mobile', label: 'Mobile Experience' },
    { value: 'performance', label: 'Performance & Speed' },
    { value: 'other', label: 'Other' }
  ];

  const userTypes = [
    { value: 'individual', label: 'Individual Creator' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'small-business', label: 'Small Business Owner' },
    { value: 'marketing-agency', label: 'Marketing Agency' },
    { value: 'enterprise', label: 'Enterprise User' },
    { value: 'developer', label: 'Developer/Technical User' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const featureRequest = {
        ...formData,
        userId: user?.uid || null,
        status: 'submitted',
        votes: 1, // Initial vote from submitter
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        type: 'feature_request'
      };

      await addDoc(collection(db, 'support_requests'), featureRequest);
      
      setIsSubmitted(true);
      setFormData({
        name: user?.displayName || '',
        email: user?.email || '',
        featureCategory: '',
        featureTitle: '',
        description: '',
        useCase: '',
        expectedBenefit: '',
        priority: 'medium',
        userType: '',
        willingnessToTest: false
      });
    } catch (err) {
      console.error('Error submitting feature request:', err);
      setError('Failed to submit your feature request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 lg:py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Feature Request Submitted!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Thank you for your feature request! We've added it to our product roadmap for consideration. 
                We'll keep you updated on its progress and may reach out if we need more details.
              </p>
              <Button 
                onClick={() => setIsSubmitted(false)}
                className="mr-4"
              >
                Submit Another Request
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 lg:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl">
                <Lightbulb className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Feature Requests
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Have an idea for a new feature? We'd love to hear it! Your suggestions help us improve and build the tools you need.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 lg:p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>

                {/* User Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Users className="inline h-4 w-4 mr-1" />
                    I am a... *
                  </label>
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select your user type</option>
                    {userTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Feature Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Tag className="inline h-4 w-4 mr-1" />
                    Feature Category *
                  </label>
                  <select
                    name="featureCategory"
                    value={formData.featureCategory}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {featureCategories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Feature Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="inline h-4 w-4 mr-1" />
                    Feature Title *
                  </label>
                  <input
                    type="text"
                    name="featureTitle"
                    value={formData.featureTitle}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Give your feature a descriptive name"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Star className="inline h-4 w-4 mr-1" />
                    Priority Level
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Nice to Have - Would be useful</option>
                    <option value="medium">Important - Would significantly improve my workflow</option>
                    <option value="high">Critical - I really need this feature</option>
                  </select>
                </div>

                {/* Feature Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    placeholder="Describe the feature in detail. What should it do? How should it work?"
                  />
                </div>

                {/* Use Case */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Use Case & Problem It Solves *
                  </label>
                  <textarea
                    name="useCase"
                    value={formData.useCase}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    placeholder="Describe when and why you would use this feature. What problem does it solve for you?"
                  />
                </div>

                {/* Expected Benefit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <TrendingUp className="inline h-4 w-4 mr-1" />
                    Expected Benefit *
                  </label>
                  <textarea
                    name="expectedBenefit"
                    value={formData.expectedBenefit}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    placeholder="How would this feature benefit you and other users? What improvements would it bring?"
                  />
                </div>

                {/* Willingness to Test */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="willingnessToTest"
                      checked={formData.willingnessToTest}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      I'm willing to beta test this feature when it becomes available
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Feature Request
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </form>

              {/* Additional Information */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  What Happens Next?
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>• Your request will be reviewed by our product team</p>
                  <p>• We'll consider factors like user impact, feasibility, and alignment with our roadmap</p>
                  <p>• Popular requests may be prioritized based on community feedback</p>
                  <p>• You'll receive updates if your feature is selected for development</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}