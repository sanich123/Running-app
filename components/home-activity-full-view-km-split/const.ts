import { LANGUAGES } from '../../constants/enums';

export const KM_SPLITS = {
  [LANGUAGES.english]: {
    splits: 'Splits',
    pace: 'PACE',
    elev: 'ELEV',
    km: 'KM',
  },
  [LANGUAGES.russian]: {
    splits: 'Отрезки',
    pace: 'ТЕМП',
    elev: 'ВЫС',
    km: 'КМ',
  },
} as const;
