export const languages = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  },
  es: {
    code: 'es', 
    name: 'Español',
    flag: '🇪🇸'
  },
  fr: {
    code: 'fr',
    name: 'Français', 
    flag: '🇫🇷'
  }
} as const;

export type LanguageCode = keyof typeof languages;
export type Language = typeof languages[LanguageCode];