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

export const ACTIVITY_VISIBILITY_DESCRIPTIONS = {
  [LANGUAGES.english]: {
    public: 'Visible to all users',
    followers: 'Visible to you and your followers',
    private: 'Visible only to you',
  },
  [LANGUAGES.russian]: {
    public: 'Видна всем пользователям',
    followers: 'Видна вам и вашим подписчикам',
    private: 'Видна только вам',
  },
} as const;

export const ACTIVITY_VISIBILITY_SECTION_LABELS = {
  [LANGUAGES.english]: 'Who can see this workout?',
  [LANGUAGES.russian]: 'Кто видит эту тренировку?',
} as const;

export const ACTIVITY_VISIBILITY_ICONS = {
  public: 'earth',
  followers: 'account-multiple-outline',
  private: 'lock-outline',
} as const;
