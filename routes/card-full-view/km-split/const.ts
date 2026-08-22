import { LANGUAGES } from '../../../constants/enums';

export const KM_SPLITS = {
  [LANGUAGES.english]: {
    splits: 'Splits',
    pace: 'PACE',
    speed: 'SPEED',
    cadence: 'CADENCE',
    elev: 'ELEV',
    km: 'KM',
    kmh: 'km/h',
    spm: 'spm',
  },
  [LANGUAGES.russian]: {
    splits: 'Отрезки',
    pace: 'ТЕМП',
    speed: 'СКОРОСТЬ',
    cadence: 'КАДЕНС',
    elev: 'ВЫС',
    km: 'КМ',
    kmh: 'км/ч',
    spm: 'шагов/мин',
  },
} as const;
