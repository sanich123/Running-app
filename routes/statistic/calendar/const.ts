import { LANGUAGES } from '@const/enums';

export enum REDUCED_DAY_NAME_RU {
  monday = 'ПН',
  tuesday = 'ВТ',
  wednesday = 'СР',
  thursday = 'ЧТ',
  friday = 'ПТ',
  saturday = 'СБ',
  sunday = 'ВС',
}

export enum REDUCED_DAY_NAME_EN {
  monday = 'MO',
  tuesday = 'TU',
  wednesday = 'WE',
  thursday = 'TH',
  friday = 'FR',
  saturday = 'SA',
  sunday = 'SU',
}

export const CALENDAR_ACTIVITIES_COPY = {
  [LANGUAGES.russian]: {
    openWorkoutHint: 'Нажмите на день, чтобы открыть тренировку',
  },
  [LANGUAGES.english]: {
    openWorkoutHint: 'Tap a day to open a workout',
  },
} as const;
