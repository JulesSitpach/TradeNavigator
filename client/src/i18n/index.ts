import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Master Translation System - Unified Architecture for Mexico & Canada Expansion
import { masterTranslations } from './masterTranslations';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: masterTranslations.en
      },
      es: {
        translation: masterTranslations.es
      }
    },
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'tradenavigator-language',
      caches: ['localStorage']
    },

    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;