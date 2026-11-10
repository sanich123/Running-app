import { getLocales } from 'expo-localization';
import { LANGUAGES } from '@const/enums';

export interface Settings {
  language: LANGUAGES;
  theme: 'light' | 'dark' | null;
  isProfileFilled: boolean;
}

export const SETTINGS_INITIAL_STATE: Settings = {
  language: getLocales()[0]?.languageCode?.toLowerCase() === 'ru' ? LANGUAGES.russian : LANGUAGES.english,
  theme: null as 'light' | 'dark' | null,
  isProfileFilled: false,
};
