import MainLayout from '@/components/layout/MainLayout';
import { Shield, Calendar, Eye, Lock, Database, UserCheck } from 'lucide-react';

export default function Privacy() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 lg:mb-12">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy Policy
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
                  <Eye className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Your Privacy Matters
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      This Privacy Policy explains how Social Content Generator collects, uses, and protects 
                      your personal information when you use our AI-powered content creation service.
                    </p>
                  </div>
                </div>
              </div>

              {/* Information We Collect */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    1. Information We Collect
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Account Information</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-400">
                      <li>Email address and display name (when you sign up)</li>
                      <li>Profile information you provide</li>
                      <li>Authentication data from third-party providers (Google, etc.)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Usage Information</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-400">
                      <li>Prompts and content you create</li>
                      <li>Generated images and social media posts</li>
                      <li>Usage statistics and feature interactions</li>
                      <li>Device information and browser type</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Technical Information</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-400">
                      <li>IP address and location data</li>
                      <li>Log files and error reports</li>
                      <li>Cookies and local storage data</li>
                      <li>Performance and analytics data</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Information */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    2. How We Use Your Information
                  </h3>
                </div>
                
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p>We use your information to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Provide our service:</strong> Process your requests and generate content</li>
                    <li><strong>Improve functionality:</strong> Enhance features and fix issues</li>
                    <li><strong>Personalize experience:</strong> Tailor content and recommendations</li>
                    <li><strong>Customer support:</strong> Respond to questions and provide assistance</li>
                    <li><strong>Security:</strong> Protect against fraud and abuse</li>
                    <li><strong>Analytics:</strong> Understand usage patterns and performance</li>
                    <li><strong>Communication:</strong> Send important updates and notifications</li>
                  </ul>
                </div>
              </section>

              {/* Data Sharing */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  3. How We Share Your Information
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      We do not sell your personal information
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Your privacy is important to us. We only share information in specific circumstances outlined below.
                    </p>
                  </div>

                  <div className="space-y-3 text-gray-600 dark:text-gray-400">
                    <p><strong>We may share information with:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Service providers:</strong> Third-party AI services (OpenAI, Gemini, BRIA AI) for content generation</li>
                      <li><strong>Analytics providers:</strong> To understand usage and improve our service</li>
                      <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
                      <li><strong>Business transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                      <li><strong>With your consent:</strong> When you explicitly authorize sharing</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Third-Party Services */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  4. Third-Party Services
                </h3>
                
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p>Our service integrates with third-party AI providers:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Google Gemini:</strong> For AI content generation and enhancement</li>
                    <li><strong>BRIA AI:</strong> For image generation services</li>
                    <li><strong>Firebase/Google Cloud:</strong> For authentication and data storage</li>
                    <li><strong>Vercel:</strong> For hosting and performance optimization</li>
                  </ul>
                  <p>
                    These services have their own privacy policies. We recommend reviewing their practices 
                    as your data may be processed by them when using our features.
                  </p>
                </div>
              </section>

              {/* Data Security */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    5. Data Security
                  </h3>
                </div>
                
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p>We protect your information through:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Encryption:</strong> Data encrypted in transit and at rest</li>
                    <li><strong>Access controls:</strong> Limited access to personal information</li>
                    <li><strong>Secure infrastructure:</strong> Industry-standard security measures</li>
                    <li><strong>Regular monitoring:</strong> Continuous security assessments</li>
                    <li><strong>Incident response:</strong> Procedures for handling security breaches</li>
                  </ul>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Important:</strong> No method of transmission over the internet is 100% secure. 
                      While we strive to protect your data, we cannot guarantee absolute security.
                    </p>
                  </div>
                </div>
              </section>

              {/* Your Rights */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  6. Your Privacy Rights
                </h3>
                
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Access:</strong> Request a copy of your personal information</li>
                    <li><strong>Update:</strong> Correct or update your account information</li>
                    <li><strong>Delete:</strong> Request deletion of your account and data</li>
                    <li><strong>Export:</strong> Download your content and data</li>
                    <li><strong>Opt-out:</strong> Unsubscribe from promotional communications</li>
                    <li><strong>Restrict:</strong> Limit how we process your information</li>
                  </ul>
                  
                  <p>
                    To exercise these rights, please contact us using the information provided below.
                  </p>
                </div>
              </section>

              {/* Data Retention */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  7. Data Retention
                </h3>
                
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p>We retain your information:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Account data:</strong> Until you delete your account</li>
                    <li><strong>Content:</strong> As long as you keep it in your account</li>
                    <li><strong>Usage logs:</strong> For up to 2 years for analytics and security</li>
                    <li><strong>Legal requirements:</strong> As required by applicable laws</li>
                  </ul>
                  
                  <p>
                    After account deletion, we will remove or anonymize your personal information 
                    within 30 days, except where required by law.
                  </p>
                </div>
              </section>

              {/* Cookies */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  8. Cookies and Tracking
                </h3>
                
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p>We use cookies and similar technologies for:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Authentication and session management</li>
                    <li>Remembering your preferences and settings</li>
                    <li>Analytics and performance monitoring</li>
                    <li>Security and fraud prevention</li>
                  </ul>
                  
                  <p>
                    You can control cookies through your browser settings, but some features 
                    may not work properly if cookies are disabled.
                  </p>
                </div>
              </section>

              {/* International Users */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  9. International Data Transfers
                </h3>
                
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p>
                    Our service is hosted globally and may transfer your data across borders. 
                    We ensure appropriate safeguards are in place for international transfers, 
                    including standard contractual clauses and adequacy decisions.
                  </p>
                </div>
              </section>

              {/* Children's Privacy */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  10. Children's Privacy
                </h3>
                
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p>
                    Our service is not intended for children under 13 years of age. We do not 
                    knowingly collect personal information from children under 13. If you believe 
                    a child has provided us with personal information, please contact us immediately.
                  </p>
                </div>
              </section>

              {/* Updates */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  11. Policy Updates
                </h3>
                
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of 
                    material changes through our service or via email. The "Last updated" date 
                    at the top of this policy indicates when it was last revised.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  12. Contact Us
                </h3>
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  <p>
                    If you have questions about this Privacy Policy or our data practices:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p><strong>Email:</strong> privacy@socialcontentgenerator.com</p>
                    <div className="flex gap-3 items-center">
                      <strong>Follow us:</strong>
                      <a
                        href="https://twitter.com/Equaldev1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                      >
                        Twitter
                      </a>
                      <a
                        href="https://instagram.com/equal.dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 bg-pink-500 hover:bg-pink-600 text-white rounded text-sm transition-colors"
                      >
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