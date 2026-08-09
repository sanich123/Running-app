import { LANGUAGES } from '@const/enums';

export const EMPTY_USERS_LIST = {
  [LANGUAGES.english]: 'There are no users with this name or email',
  [LANGUAGES.russian]: 'Пользователи с такими данными не найдены',
} as const;
