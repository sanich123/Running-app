import { LANGUAGES } from './enums';

export const ACTIVITY_VISIBILITY = {
  public: 'public',
  followers: 'followers',
  private: 'private',
} as const;

export type ActivityVisibility = (typeof ACTIVITY_VISIBILITY)[keyof typeof ACTIVITY_VISIBILITY];

export const ACTIVITY_VISIBILITY_LABELS = {
  [LANGUAGES.english]: {
    public: 'Everyone',
    followers: 'Followers',
    private: 'Only me',
  },
  [LANGUAGES.russian]: {
    public: 'Все',
    followers: 'Подписчики',
    private: 'Только я',
  },
} as const;

export const ACTIVITY_VISIBILITY_SECTION_LABELS = {
  [LANGUAGES.english]: 'Who can see the workout?',
  [LANGUAGES.russian]: 'Кто видит тренировку?',
} as const;
