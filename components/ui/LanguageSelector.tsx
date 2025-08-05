'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageInfo } from '@/lib/utils/language';

interface LanguageSelectorProps {
  selectedLanguage?: string;
  detectedLanguage?: string;
  onLanguageChange: (languageCode: string | undefined) => void;
  disabled?: boolean;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  detectedLanguage = 'en',
  onLanguageChange,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const getCurrentLanguage = (): LanguageInfo => {
    if (selectedLanguage) {
      return SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];
    }
    return SUPPORTED_LANGUAGES.find(lang => lang.code === detectedLanguage) || SUPPORTED_LANGUAGES[0];
  };

  const getDetectedLanguage = (): LanguageInfo => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === detectedLanguage) || SUPPORTED_LANGUAGES[0];
  };

  const handleLanguageSelect = (languageCode: string) => {
    if (languageCode === detectedLanguage) {
      // If selecting the detected language, remove override
      onLanguageChange(undefined);
    } else {
      onLanguageChange(languageCode);
    }
    setIsOpen(false);
  };

  const currentLanguage = getCurrentLanguage();
  const detectedLang = getDetectedLanguage();
  const isOverridden = selectedLanguage && selectedLanguage !== detectedLanguage;

  return (
    <div className={`relative ${className}`}>
      <Button
        ref={buttonRef}
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full justify-between h-12 px-4 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        <div className="flex items-center gap-3">
          <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentLanguage.flag}</span>
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">
                {currentLanguage.nativeName}
              </div>
              {isOverridden && (
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  Override (detected: {detectedLang.nativeName})
                </div>
              )}
              {!isOverridden && detectedLanguage && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Auto-detected
                </div>
              )}
            </div>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40" />
          
          {/* Dropdown */}
          <div 
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-80 overflow-auto"
          >
            {/* Auto-detect option */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleLanguageSelect(detectedLanguage)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  !selectedLanguage ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{detectedLang.flag}</span>
                  <div>
                    <div className="font-medium">Auto-detect</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Currently: {detectedLang.nativeName}
                    </div>
                  </div>
                </div>
                {!selectedLanguage && (
                  <Check className="h-4 w-4 ml-auto" />
                )}
              </button>
            </div>

            {/* Language options */}
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-3">
                Override Language
              </div>
              {SUPPORTED_LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    selectedLanguage === language.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{language.name}</div>
                  </div>
                  {selectedLanguage === language.code && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;