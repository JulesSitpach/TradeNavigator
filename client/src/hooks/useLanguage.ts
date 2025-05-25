import { useTranslation } from 'react-i18next';

export function useLanguage() {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lang: string) => {
    console.log('Changing language to:', lang);
    i18n.changeLanguage(lang);
  };

  // Enhanced translation function with namespace support
  const translate = (key: string, options?: { ns?: string; [key: string]: any }) => {
    return t(key, options);
  };

  return { 
    language: i18n.language, 
    setLanguage: changeLanguage, 
    t: translate
  };
}