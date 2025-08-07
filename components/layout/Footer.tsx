"use client";

import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Prompt Generator', href: '/prompts' },
        { name: 'Image Creator', href: '/images' },
        { name: 'Social Posts', href: '/social' },
        { name: 'Gallery', href: '/gallery' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms & Conditions', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '#' },
        { name: 'Contact Us', href: 'mailto:support@socialcontentgenerator.com' },
        { name: 'Feature Requests', href: '#' },
        { name: 'Bug Reports', href: '#' },
      ]
    }
  ];

  const socialLinks = [
    { name: 'GitHub', href: '#', icon: Github },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Email', href: 'mailto:hello@socialcontentgenerator.com', icon: Mail },
  ];

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                Social Content Generator
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
              Create amazing content with AI-powered tools. Generate prompts, create images, 
              and craft engaging social media posts effortlessly.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>© {currentYear} Social Content Generator.</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                Made with <Heart className="h-3 w-3 text-red-500 fill-current" /> for creators
              </span>
            </div>

            {/* Additional Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
              <span>Powered by AI</span>
              <span className="hidden sm:inline">•</span>
              <span>Version 1.0.0</span>
            </div>
          </div>
          
          {/* Mobile-specific legal links */}
          <div className="flex items-center justify-center gap-4 mt-4 sm:hidden">
            <Link
              href="/terms"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Terms
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link
              href="/privacy"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}