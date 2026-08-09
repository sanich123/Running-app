import { LANGUAGES } from '@const/enums';

export const EMPTY_ACTIVITIES_LIST = {
  [LANGUAGES.english]: {
    emptyActivities: 'No activities yet — your next adventure starts here!',
  },
  [LANGUAGES.russian]: {
    emptyActivities: 'Активностей пока нет — ваше следующее приключение начнётся здесь!',
  },
} as const;
