import { LANGUAGES } from '@const/enums';

export const SEARCH_INPUT = {
  [LANGUAGES.english]: {
    label: 'Type user email or name',
  },
  [LANGUAGES.russian]: {
    label: 'Введите имя или email юзера',
  },
} as const;

export interface SearchInputProps {
  setSearch: (arg: string) => void;
  setIsInitial: (arg: boolean) => void;
  search: string;
}
