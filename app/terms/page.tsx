import MainLayout from '@/components/layout/MainLayout';
import { ScrollText, Calendar, Shield, AlertTriangle } from 'lucide-react';

export default function Terms() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 lg:mb-12">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                <ScrollText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Terms and Conditions
            </h1>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 lg:p-8 space-y-8">
              
              {/* Introduction */}
              <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3 mb-4">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Welcome to Social Content Generator
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      These Terms and Conditions ("Terms") govern your use of the Social Content Generator application 
                      and related services. By accessing or using our service, you agree to be bound by these Terms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Description */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  1. Service Description
                </h3>
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p>
                    Social Content Generator is an AI-powered platform that helps users create:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Optimized prompts for AI image generation</li>
                    <li>AI-generated images using third-party services</li>
                    <li>Social media content for multiple platforms</li>
                    <li>Content management and organization tools</li>
                  </ul>
                </div>
              </section>

              {/* User Accounts */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  2. User Accounts
                </h3>
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p>
                    To access certain features, you may need to create an account. You are responsible for:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Maintaining the confidentiality of your account credentials</li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized use</li>
                    <li>Providing accurate and up-to-date information</li>
                  </ul>
                </div>
              </section>

              {/* Acceptable Use */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  3. Acceptable Use Policy
                </h3>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                        Important Guidelines
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        You must use our service responsibly and in compliance with all applicable laws.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p><strong>You agree NOT to use our service to:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Generate harmful, illegal, or inappropriate content</li>
                    <li>Infringe on intellectual property rights</li>
                    <li>Spread misinformation or harmful content</li>
                    <li>Violate any applicable laws or regulations</li>
                    <li>Attempt to reverse engineer or compromise our systems</li>
                    <li>Use automated tools to abuse our service</li>
                  </ul>
                </div>
              </section>

              {/* Content and Intellectual Property */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  4. Content and Intellectual Property
                </h3>
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white mb-2">Your Content:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>You retain rights to content you create using our service</li>
                      <li>You grant us necessary rights to provide and improve our service</li>
                      <li>You're responsible for ensuring your content doesn't violate third-party rights</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white mb-2">Our Service:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>We own or license the technology, software, and systems</li>
                      <li>Our service is protected by intellectual property laws</li>
                      <li>You may not copy, modify, or distribute our software</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Third-Party Services */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  5. Third-Party Services
                </h3>
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p>
                    Our service integrates with third-party AI providers and services. We are not responsible for:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>The availability or performance of third-party services</li>
                    <li>Content generated by third-party AI models</li>
                    <li>Third-party terms of service or privacy policies</li>
                    <li>Any costs associated with third-party services</li>
                  </ul>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  6. Limitation of Liability
                </h3>
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p>
                    Our service is provided "as is" without warranties. We are not liable for:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Indirect, incidental, or consequential damages</li>
                    <li>Loss of data, profits, or business opportunities</li>
                    <li>Service interruptions or technical issues</li>
                    <li>Content generated by AI systems</li>
                    <li>Actions taken based on generated content</li>
                  </ul>
                </div>
              </section>

              {/* Privacy */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  7. Privacy and Data
                </h3>
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p>
                    Your privacy is important to us. Please review our Privacy Policy to understand 
                    how we collect, use, and protect your information. By using our service, you 
                    consent to our data practices as described in the Privacy Policy.
                  </p>
                </div>
              </section>

              {/* Termination */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  8. Termination
                </h3>
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p>
                    We may suspend or terminate your access to our service at any time for:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Violation of these Terms</li>
                    <li>Suspected fraudulent or harmful activity</li>
                    <li>Extended inactivity</li>
                    <li>Legal or regulatory requirements</li>
                  </ul>
                  <p>
                    You may terminate your account at any time by discontinuing use of our service.
                  </p>
                </div>
              </section>

              {/* Changes to Terms */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  9. Changes to Terms
                </h3>
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p>
                    We may update these Terms from time to time. We will notify users of material 
                    changes through our service or via email. Continued use after changes constitutes 
                    acceptance of the new Terms.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  10. Contact Us
                </h3>
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  <p>
                    If you have questions about these Terms, please contact us:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                    <div className="flex gap-3">
                      <a
                        href="https://twitter.com/Equaldev1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        Twitter
                      </a>
                      <a
                        href="https://instagram.com/equal.dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-md text-sm transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        Instagram
                      </a>
                    </div>
                    <p><strong>Website:</strong> https://socialcontentgenerator.com</p>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}