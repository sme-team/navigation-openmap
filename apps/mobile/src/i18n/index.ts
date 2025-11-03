import {useCallback} from 'react';
import i18n from 'i18next';
import {initReactI18next, useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '@/utils/storage';

import allEn from './en';
import allVi from './vi';

// === i18n/index.ts (File chính để merge tất cả) ===

// Merge tất cả từ điển tiếng Anh
const en = {
  ...allEn,
  // Thêm các màn hình khác...
};
// Merge tất cả từ điển tiếng Việt
const vi = {
  ...allVi,
  // Thêm các màn hình khác...
};

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (cb: (lang: string) => void) => {
    const savedLang = await AsyncStorage.getItem(STORAGE_KEYS.APP_LANGUAGE);
    cb(savedLang || 'vi');
  },
  init: () => {},
  cacheUserLanguage: async (lang: string) => {
    await AsyncStorage.setItem(STORAGE_KEYS.APP_LANGUAGE, lang);
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {translation: en},
      vi: {translation: vi},
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: true,      
    },
    debug: true,
  });

export const useLanguage = () => {
  const {t, i18n} = useTranslation();
  const toggleLanguage = useCallback(async () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    await i18n.changeLanguage(newLang);
    await AsyncStorage.setItem('APP_LANGUAGE', newLang);
  }, [i18n]);

  return {
    t,
    i18n,
    toggleLanguage,
  };
};

export default i18n;
