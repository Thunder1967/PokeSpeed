import { Locale, TranslationSchema } from './types';
import { zhTW } from './locales/zh-TW';
import { en } from './locales/en';

export * from './types';

const STORAGE_KEY = 'pokespeed_locale';

const dictionaries: Record<Locale, TranslationSchema> = {
  'zh-TW': zhTW,
  'en': en
};

function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'zh-TW';
  const langs = navigator.languages || [navigator.language || ''];
  for (const lang of langs) {
    if (lang.toLowerCase().startsWith('zh')) {
      return 'zh-TW';
    }
  }
  return 'en';
}

function getInitialLocale(): Locale {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && (saved === 'zh-TW' || saved === 'en')) {
      return saved;
    }
  }
  return detectBrowserLocale();
}

let currentLocale: Locale = getInitialLocale();
const listeners = new Set<(locale: Locale) => void>();

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  if (currentLocale === locale) return;
  currentLocale = locale;
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEY, locale);
  }
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = locale;
  }
  for (const listener of listeners) {
    listener(currentLocale);
  }
}

export function toggleLocale(): Locale {
  const next = currentLocale === 'zh-TW' ? 'en' : 'zh-TW';
  setLocale(next);
  return next;
}

export function t(): TranslationSchema {
  return dictionaries[currentLocale] || dictionaries['zh-TW'];
}

export function subscribeLocale(listener: (locale: Locale) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
