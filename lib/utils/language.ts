// Language detection and management utilities

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

// Simple language detection based on common patterns and words
export function detectLanguage(text: string): string {
  const cleanText = text.toLowerCase().trim();
  
  // Common words/patterns for each language
  const patterns = {
    es: [
      'el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'una', 'del', 'los', 'las', 'está', 'está',
      'ción', 'idad', 'mente', 'ñ', 'español', 'empresa', 'trabajo', 'negocio', 'producto', 'servicio'
    ],
    en: [
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'tion', 'ness', 'ment', 'business', 'company', 'work', 'product', 'service', 'marketing'
    ],
    pt: [
      'o', 'de', 'a', 'e', 'que', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais',
      'ção', 'dade', 'mente', 'ã', 'português', 'empresa', 'trabalho', 'negócio', 'produto', 'serviço'
    ],
    fr: [
      'le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se',
      'tion', 'ment', 'ique', 'eur', 'français', 'entreprise', 'travail', 'produit', 'service'
    ],
    it: [
      'il', 'di', 'che', 'e', 'la', 'per', 'un', 'in', 'con', 'del', 'da', 'a', 'al', 'le', 'si', 'dei', 'sul', 'una', 'della', 'nell',
      'zione', 'mente', 'ità', 'italiano', 'azienda', 'lavoro', 'prodotto', 'servizio'
    ],
    de: [
      'der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als',
      'ung', 'keit', 'lich', 'deutsch', 'unternehmen', 'arbeit', 'produkt', 'service'
    ],
    ja: [
      'の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ', 'ある', 'いる', 'も', 'する', 'から', 'な', 'こと', 'として',
      'ひらがな', 'カタカナ', '会社', '仕事', '製品', 'サービス'
    ],
    ko: [
      '이', '의', '가', '을', '들', '에', '는', '와', '로', '으로', '에서', '까지', '한', '하다', '되다', '있다', '없다', '것', '수', '때',
      '회사', '일', '제품', '서비스'
    ],
    zh: [
      '的', '了', '和', '是', '就', '都', '而', '及', '与', '或', '但', '这', '那', '我', '你', '他', '她', '它', '们', '在',
      '公司', '工作', '产品', '服务'
    ],
    ru: [
      'в', 'и', 'не', 'на', 'я', 'быть', 'то', 'он', 'оно', 'как', 'но', 'да', 'его', 'за', 'от', 'по', 'при', 'все', 'она', 'так',
      'компания', 'работа', 'продукт', 'услуга'
    ],
    ar: [
      'في', 'من', 'إلى', 'على', 'أن', 'هذا', 'هذه', 'التي', 'الذي', 'كان', 'كما', 'لكن', 'أو', 'بعد', 'قد', 'لم', 'عند', 'حيث', 'بين', 'عن',
      'شركة', 'عمل', 'منتج', 'خدمة'
    ],
    hi: [
      'और', 'का', 'में', 'की', 'को', 'से', 'है', 'एक', 'के', 'पर', 'यह', 'होता', 'था', 'हैं', 'थे', 'लिए', 'साथ', 'तक', 'भी', 'जो',
      'कंपनी', 'काम', 'उत्पाद', 'सेवा'
    ]
  };

  let scores: { [key: string]: number } = {};
  
  // Initialize scores
  Object.keys(patterns).forEach(lang => {
    scores[lang] = 0;
  });

  // Check for character-based languages first
  if (/[\u4e00-\u9fff]/.test(cleanText)) {
    scores.zh += 10;
  }
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(cleanText)) {
    scores.ja += 10;
  }
  if (/[\uac00-\ud7af]/.test(cleanText)) {
    scores.ko += 10;
  }
  if (/[\u0600-\u06ff]/.test(cleanText)) {
    scores.ar += 10;
  }
  if (/[\u0900-\u097f]/.test(cleanText)) {
    scores.hi += 10;
  }

  // Check for Latin-based languages
  const words = cleanText.split(/\s+/);
  
  words.forEach(word => {
    Object.entries(patterns).forEach(([lang, pattern]) => {
      if (pattern.includes(word)) {
        scores[lang] += 1;
      }
    });
  });

  // Spanish-specific patterns
  if (/ñ/.test(cleanText)) scores.es += 2;
  if (/¿|¡/.test(cleanText)) scores.es += 2;
  
  // Portuguese-specific patterns
  if (/ã|õ|ç/.test(cleanText)) scores.pt += 2;
  
  // French-specific patterns
  if (/à|é|è|ê|ç|œ/.test(cleanText)) scores.fr += 2;
  
  // German-specific patterns
  if (/ä|ö|ü|ß/.test(cleanText)) scores.de += 2;

  // Find the language with highest score
  const detectedLang = Object.entries(scores).reduce((a, b) => 
    scores[a[0]] > scores[b[0]] ? a : b
  )[0];

  // Default to English if no clear winner or very low scores
  if (scores[detectedLang] < 2) {
    return 'en';
  }

  return detectedLang;
}

export function getLanguageInfo(code: string): LanguageInfo {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || SUPPORTED_LANGUAGES[0];
}

export function getLanguageName(code: string): string {
  const lang = getLanguageInfo(code);
  return lang.nativeName;
}