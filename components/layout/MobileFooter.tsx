"use client";

import React from 'react';
import Link from 'next/link';

export default function MobileFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="lg:hidden bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6 px-4 mb-20">
      <div className="max-w-md mx-auto text-center space-y-3">
        {/* Legal Links */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <Link
            href="/terms"
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Terms & Conditions
          </Link>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <Link
            href="/privacy"
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
        
        {/* Copyright */}
        <div className="text-xs text-gray-500 dark:text-gray-500">
          © {currentYear} Social Content Generator. All rights reserved.
        </div>
        
        {/* Version */}
        <div className="text-xs text-gray-400 dark:text-gray-600">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}