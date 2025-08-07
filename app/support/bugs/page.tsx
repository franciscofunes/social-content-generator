"use client";

import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { 
  Bug, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  User,
  Mail,
  FileText,
  Monitor,
  Smartphone,
  AlertTriangle,
  List,
  Target,
  Zap
} from 'lucide-react';

interface BugReportData {
  name: string;
  email: string;
  bugTitle: string;
  bugCategory: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  additionalInfo: string;
  deviceInfo: {
    browser: string;
    browserVersion: string;
    operatingSystem: string;
    deviceType: string;
    screenSize: string;
  };
  pageUrl: string;
  frequency: string;
  workaroundFound: boolean;
  attachmentNote: string;
}

export default function BugReports() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<BugReportData>({
    name: user?.displayName || '',
    email: user?.email || '',
    bugTitle: '',
    bugCategory: '',
    severity: 'medium',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    additionalInfo: '',
    deviceInfo: {
      browser: '',
      browserVersion: '',
      operatingSystem: '',
      deviceType: '',
      screenSize: ''
    },
    pageUrl: '',
    frequency: '',
    workaroundFound: false,
    attachmentNote: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-detect device information
  useEffect(() => {
    const detectDeviceInfo = () => {
      const userAgent = navigator.userAgent;
      const screen = window.screen;
      
      // Detect browser
      let browser = 'Unknown';
      let browserVersion = 'Unknown';
      
      if (userAgent.includes('Chrome')) {
        browser = 'Chrome';
        const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
      } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
        const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
      } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browser = 'Safari';
        const match = userAgent.match(/Safari\/(\d+\.\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
      } else if (userAgent.includes('Edge')) {
        browser = 'Edge';
        const match = userAgent.match(/Edge\/(\d+\.\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
      }

      // Detect OS
      let operatingSystem = 'Unknown';
      if (userAgent.includes('Windows')) operatingSystem = 'Windows';
      else if (userAgent.includes('Mac')) operatingSystem = 'macOS';
      else if (userAgent.includes('Linux')) operatingSystem = 'Linux';
      else if (userAgent.includes('Android')) operatingSystem = 'Android';
      else if (userAgent.includes('iOS')) operatingSystem = 'iOS';

      // Detect device type
      const deviceType = /Mobi|Android/i.test(userAgent) ? 'Mobile' : 'Desktop';

      // Screen size
      const screenSize = `${screen.width}x${screen.height}`;

      setFormData(prev => ({
        ...prev,
        deviceInfo: {
          browser,
          browserVersion,
          operatingSystem,
          deviceType,
          screenSize
        },
        pageUrl: window.location.href
      }));
    };

    detectDeviceInfo();
  }, []);

  const bugCategories = [
    { value: 'ui-display', label: 'UI/Display Issues' },
    { value: 'functionality', label: 'Feature Not Working' },
    { value: 'performance', label: 'Performance/Speed Issues' },
    { value: 'login-auth', label: 'Login/Authentication' },
    { value: 'data-sync', label: 'Data Not Saving/Loading' },
    { value: 'image-generation', label: 'Image Generation Issues' },
    { value: 'prompt-creation', label: 'Prompt Creation Problems' },
    { value: 'social-posting', label: 'Social Media Integration' },
    { value: 'mobile-responsive', label: 'Mobile Responsiveness' },
    { value: 'browser-compatibility', label: 'Browser Compatibility' },
    { value: 'other', label: 'Other' }
  ];

  const frequencyOptions = [
    { value: 'always', label: 'Always - Happens every time' },
    { value: 'often', label: 'Often - Happens most of the time' },
    { value: 'sometimes', label: 'Sometimes - Happens occasionally' },
    { value: 'rarely', label: 'Rarely - Happened once or twice' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name.startsWith('deviceInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        deviceInfo: {
          ...prev.deviceInfo,
          [field]: value
        }
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
      const bugReport = {
        ...formData,
        userId: user?.uid || null,
        status: 'new',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        type: 'bug_report'
      };

      await addDoc(collection(db, 'support_requests'), bugReport);
      
      setIsSubmitted(true);
      // Reset form but keep device info
      const currentDeviceInfo = formData.deviceInfo;
      const currentPageUrl = formData.pageUrl;
      setFormData({
        name: user?.displayName || '',
        email: user?.email || '',
        bugTitle: '',
        bugCategory: '',
        severity: 'medium',
        stepsToReproduce: '',
        expectedBehavior: '',
        actualBehavior: '',
        additionalInfo: '',
        deviceInfo: currentDeviceInfo,
        pageUrl: currentPageUrl,
        frequency: '',
        workaroundFound: false,
        attachmentNote: ''
      });
    } catch (err) {
      console.error('Error submitting bug report:', err);
      setError('Failed to submit your bug report. Please try again.');
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
                Bug Report Submitted!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Thank you for reporting this bug! We've received your report and our development team will investigate it. 
                We'll keep you updated on the progress via email.
              </p>
              <Button 
                onClick={() => setIsSubmitted(false)}
                className="mr-4"
              >
                Report Another Bug
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
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl">
                <Bug className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Bug Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Found a bug? Help us fix it by providing detailed information about the issue you encountered.
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

                {/* Bug Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="inline h-4 w-4 mr-1" />
                    Bug Title *
                  </label>
                  <input
                    type="text"
                    name="bugTitle"
                    value={formData.bugTitle}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the bug (e.g., 'Image generation fails with error message')"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Zap className="inline h-4 w-4 mr-1" />
                    Bug Category *
                  </label>
                  <select
                    name="bugCategory"
                    value={formData.bugCategory}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select bug category</option>
                    {bugCategories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <AlertTriangle className="inline h-4 w-4 mr-1" />
                    Severity *
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low - Minor inconvenience</option>
                    <option value="medium">Medium - Affects functionality</option>
                    <option value="high">High - Blocks important features</option>
                    <option value="critical">Critical - App unusable</option>
                  </select>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    How often does this happen? *
                  </label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select frequency</option>
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Steps to Reproduce */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <List className="inline h-4 w-4 mr-1" />
                    Steps to Reproduce *
                  </label>
                  <textarea
                    name="stepsToReproduce"
                    value={formData.stepsToReproduce}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    placeholder="Please list the exact steps to reproduce this bug:&#10;1. Go to...&#10;2. Click on...&#10;3. Enter...&#10;4. See error"
                  />
                </div>

                {/* Expected Behavior */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Target className="inline h-4 w-4 mr-1" />
                    Expected Behavior *
                  </label>
                  <textarea
                    name="expectedBehavior"
                    value={formData.expectedBehavior}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    placeholder="What did you expect to happen?"
                  />
                </div>

                {/* Actual Behavior */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Actual Behavior *
                  </label>
                  <textarea
                    name="actualBehavior"
                    value={formData.actualBehavior}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    placeholder="What actually happened? Include any error messages you saw."
                  />
                </div>

                {/* Device Information */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Device Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Browser
                      </label>
                      <input
                        type="text"
                        name="deviceInfo.browser"
                        value={formData.deviceInfo.browser}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Browser Version
                      </label>
                      <input
                        type="text"
                        name="deviceInfo.browserVersion"
                        value={formData.deviceInfo.browserVersion}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Operating System
                      </label>
                      <input
                        type="text"
                        name="deviceInfo.operatingSystem"
                        value={formData.deviceInfo.operatingSystem}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Device Type
                      </label>
                      <input
                        type="text"
                        name="deviceInfo.deviceType"
                        value={formData.deviceInfo.deviceType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Page URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Page URL where bug occurred
                  </label>
                  <input
                    type="url"
                    name="pageUrl"
                    value={formData.pageUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/page"
                  />
                </div>

                {/* Additional Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    placeholder="Any additional details that might help us understand and fix this bug."
                  />
                </div>

                {/* Workaround */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="workaroundFound"
                      checked={formData.workaroundFound}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      I found a workaround for this bug
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
                        Submit Bug Report
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

              {/* Help Text */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Tips for Better Bug Reports
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>• <strong>Be specific:</strong> Include exact error messages and detailed steps</p>
                  <p>• <strong>Include screenshots:</strong> Visual evidence helps us understand the issue better</p>
                  <p>• <strong>Test consistently:</strong> Try to reproduce the bug multiple times</p>
                  <p>• <strong>Check for duplicates:</strong> Look for similar issues before reporting</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}