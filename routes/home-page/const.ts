import { LANGUAGES } from '@const/enums';

export const HOME_FEED = {
  my: 'my',
  followers: 'followers',
  favorites: 'favorites',
} as const;

export type HomeFeed = (typeof HOME_FEED)[keyof typeof HOME_FEED];

export const HOME_FEED_COPY = {
  [LANGUAGES.english]: {
    my: 'My',
    followers: 'Following',
    favorites: 'Favorites',
  },
  [LANGUAGES.russian]: {
    my: 'Мои',
    followers: 'Подписки',
    favorites: 'Избранное',
  },
} as const;

export const HOME_FEED_ERROR_COPY = {
  [LANGUAGES.english]: {
    title: 'Could not load the activity feed',
    retry: 'Try again',
  },
  [LANGUAGES.russian]: {
    title: 'Не удалось загрузить ленту',
    retry: 'Повторить',
  },
} as const;

export const HOME_WELCOME_TEXT = {
  greeting: (name = '') => `Good morning${name ? `, ${name}` : ''}!`,
  subtitle: 'Ready to move?',
} as const;
