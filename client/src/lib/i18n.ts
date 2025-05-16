import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "../translations/en";
import esTranslations from "../translations/es";
import frTranslations from "../translations/fr";

// Initialize i18next
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      es: {
        translation: esTranslations
      },
      fr: {
        translation: frTranslations
      }
    },
    lng: "en", // Default language
    fallbackLng: "en", // Fallback language if translation is missing
    
    interpolation: {
      escapeValue: false // React already handles this
    }
  });

export default i18n;
