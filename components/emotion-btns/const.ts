import { LANGUAGES } from '../../constants/enums';

export const enum EMOTIONS_BTNS_VALUES {
  normal = 'normal',
  fucked = 'fucked',
  good = 'good',
}

export const enum EMOTIONS_BTNS_ICONS {
  iconHappy = 'emoticon-happy-outline',
  iconNeutral = 'emoticon-neutral',
  iconFucked = 'emoticon-poop-outline',
}

export const enum EMOTIONS_BTNS_TEST_IDS {
  goodInput = 'goodInput',
  normalInput = 'normalInput',
  fuckedInput = 'fuckedInput',
}

export const EMOTION_BTNS = {
  [LANGUAGES.english]: {
    normalLabel: 'Normal',
    fuckedLabel: 'Fucked',
    fineLabel: 'Fine',
  },
  [LANGUAGES.russian]: {
    normalLabel: 'Нормал',
    fuckedLabel: 'Трахнут',
    fineLabel: 'Заебок',
  },
};
