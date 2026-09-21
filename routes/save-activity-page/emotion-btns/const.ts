import { LANGUAGES } from '@const/enums';

export const enum EMOTIONS_BTNS_VALUES {
  normal = 'normal',
  fucked = 'fucked',
  good = 'good',
}

export const enum EMOTIONS_BTNS_ICONS {
  iconHappy = 'emoticon-excited-outline',
  iconNeutral = 'emoticon-neutral-outline',
  iconFucked = 'emoticon-frown-outline',
}

export const enum EMOTIONS_BTNS_TEST_IDS {
  goodInput = 'goodInput',
  normalInput = 'normalInput',
  fuckedInput = 'fuckedInput',
}

export const EMOTION_BTNS = {
  [LANGUAGES.english]: {
    sectionLabel: 'How did the workout feel?',
    normalLabel: 'Normal',
    fuckedLabel: 'Hard',
    fineLabel: 'Fine',
  },
  [LANGUAGES.russian]: {
    sectionLabel: 'Как прошла тренировка?',
    normalLabel: 'Нормально',
    fuckedLabel: 'Тяжко',
    fineLabel: 'Класс',
  },
};

export function normalizeEmotion(value?: string | null): EMOTIONS_BTNS_VALUES | null {
  switch (value?.toLowerCase()) {
    case EMOTIONS_BTNS_VALUES.good:
    case 'happy':
    case 'energetic':
      return EMOTIONS_BTNS_VALUES.good;
    case EMOTIONS_BTNS_VALUES.normal:
    case 'calm':
      return EMOTIONS_BTNS_VALUES.normal;
    case EMOTIONS_BTNS_VALUES.fucked:
    case 'hard':
      return EMOTIONS_BTNS_VALUES.fucked;
    default:
      return null;
  }
}
