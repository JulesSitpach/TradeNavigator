import { useTranslation } from 'react-i18next';

// Master Translation Hook - Works across ALL pages for Mexico & Canada expansion
export function useMasterTranslation() {
  const { t, i18n } = useTranslation();
  
  // Universal translation function that works everywhere
  const translate = (key: string, defaultValue?: string) => {
    const translated = t(key);
    // If translation returns the key itself (not found), use the default value
    return translated === key && defaultValue ? defaultValue : translated;
  };

  const changeLanguage = (lang: string) => {
    console.log('Master translation changing language to:', lang);
    i18n.changeLanguage(lang);
  };

  return { 
    t: translate,
    language: i18n.language, 
    setLanguage: changeLanguage,
    isSpanish: i18n.language === 'es'
  };
}