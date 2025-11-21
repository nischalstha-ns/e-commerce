import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/shopTranslations';

export const useTranslation = () => {
  const language = useLanguageStore((state) => state.language);
  return translations[language];
};
