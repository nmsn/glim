import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import zhCN from './locales/zh-CN.json';

const resources = {
  en: {
    translation: en,
  },
  'zh-CN': {
    translation: zhCN,
  },
};

const SUPPORTED_LANGUAGES = ['en', 'zh-CN'];

function getBrowserLanguage(): string {
  if (typeof navigator === 'undefined') return 'en';
  
  const browserLang = navigator.language || (navigator as any).userLanguage;
  
  if (!browserLang) return 'en';
  
  if (SUPPORTED_LANGUAGES.includes(browserLang)) {
    return browserLang;
  }
  
  const baseLang = browserLang.split('-')[0];
  if (baseLang === 'zh') {
    return 'zh-CN';
  }
  if (baseLang === 'en') {
    return 'en';
  }
  
  return 'en';
}

function getDefaultLanguage(): string {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('glim-language');
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      return saved;
    }
  }
  
  return getBrowserLanguage();
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDefaultLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
