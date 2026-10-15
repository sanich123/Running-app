import { LANGUAGES } from '@const/enums';

export const FAVORITE_ACTIVITY_BUTTON_COPY = {
  [LANGUAGES.english]: {
    add: 'Add to favorites',
    remove: 'Remove from favorites',
  },
  [LANGUAGES.russian]: {
    add: 'Добавить в избранное',
    remove: 'Убрать из избранного',
  },
} as const;

export const FAVORITE_ACTIVITY_BUTTON_ICONS = {
  add: 'star-outline',
  remove: 'star',
} as const;

export const FAVORITE_ACTIVITY_BUTTON_TEST_ID = 'activity-favorite-button';
