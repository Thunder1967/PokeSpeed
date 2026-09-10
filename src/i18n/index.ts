import { SupportedLocale, TranslationSchema } from './types';
import { zhTW } from './locales/zh-TW';
import { en } from './locales/en';

export * from './types';

const STORAGE_KEY = 'pokespeed_lang';

export interface LocaleOption {
  code: SupportedLocale;
  label: string;
}

export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'en', label: 'English' }
];

const dictionaries: Record<SupportedLocale, TranslationSchema> = {
  'zh-TW': zhTW,
  'en': en
};

type LocaleListener = (locale: SupportedLocale, t: TranslationSchema) => void;

function getInitialLocale(): SupportedLocale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'zh-TW' || saved === 'en') {
      return saved;
    }
  } catch {
    // ignore storage access error
  }
  return 'zh-TW';
}

let currentLocale: SupportedLocale = getInitialLocale();
const listeners: Set<LocaleListener> = new Set();

/**
 * Synchronizes HTML document attributes (lang, title, meta description)
 * with the current locale and translation dictionary.
 */
export function syncDocumentMetadata(
  locale: SupportedLocale = currentLocale,
  dict: TranslationSchema = t(locale)
): void {
  if (typeof document === 'undefined') return;

  document.documentElement.lang = locale;
  if (dict.common.appTitleFull) {
    document.title = dict.common.appTitleFull;
  }

  let metaDesc = document.querySelector('meta[name="description"]');
  if (dict.common.metaDescription) {
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head?.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', dict.common.metaDescription);
  }
}

if (typeof document !== 'undefined') {
  syncDocumentMetadata(currentLocale);
}

/**
 * Returns the currently active locale.
 */
export function getLocale(): SupportedLocale {
  return currentLocale;
}

/**
 * Returns the translation dictionary for the active or given locale.
 */
export function t(locale: SupportedLocale = currentLocale): TranslationSchema {
  return dictionaries[locale] || dictionaries['zh-TW'];
}

/**
 * Switches the current locale, stores the preference, and notifies listeners.
 */
export function setLocale(locale: SupportedLocale): void {
  if (locale === currentLocale && dictionaries[locale]) return;
  if (!dictionaries[locale]) return;

  currentLocale = locale;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ignore storage access error
  }

  const dict = t(currentLocale);
  syncDocumentMetadata(currentLocale, dict);
  listeners.forEach(fn => {
    try {
      fn(currentLocale, dict);
    } catch (err) {
      console.error('[i18n] listener error:', err);
    }
  });
}

/**
 * Subscribes to locale change events.
 */
export function subscribeLocale(listener: LocaleListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Helper to get primary and secondary names of a Pokemon based on locale.
 * In 'zh-TW': primary = nameZh, secondary = nameEn
 * In 'en':    primary = nameEn, secondary = nameZh
 */
export function getPokemonDisplayNames(
  pokemon: { nameZh: string; nameEn: string },
  locale: SupportedLocale = currentLocale
): { primary: string; secondary: string } {
  if (locale === 'en') {
    return {
      primary: pokemon.nameEn,
      secondary: pokemon.nameZh
    };
  }
  return {
    primary: pokemon.nameZh,
    secondary: pokemon.nameEn
  };
}
