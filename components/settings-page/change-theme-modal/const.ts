import { LANGUAGES, THEMES } from '@const/enums';

export const THEMES_ARRAY = {
  [LANGUAGES.russian]: [
    { value: THEMES.dark, title: 'Тёмная' },
    { value: THEMES.light, title: 'Светлая' },
    { value: THEMES.system, title: 'Системная' },
  ],
  [LANGUAGES.english]: [
    { value: THEMES.dark, title: 'Dark' },
    { value: THEMES.light, title: 'Light' },
    { value: THEMES.system, title: 'System' },
  ],
};
