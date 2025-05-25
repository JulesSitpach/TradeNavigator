import i18n from 'i18next';

export const translateKey = (key: string, options = {}) => {
  // Intelligent translation with fallback
  const translation = i18n.t(key, {
    ...options,
    fallbackLng: 'en',
    defaultValue: `[Missing: ${key}]`
  });

  // Optional: Log missing translations
  if (translation.startsWith('[Missing:')) {
    console.warn(`Translation missing for key: ${key}`);
  }

  return translation;
};

export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
};

export const getCurrentLanguage = () => {
  return i18n.language || 'en';
};

export const getAvailableLanguages = () => {
  return ['en', 'es'];
};