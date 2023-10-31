import { LANGUAGES } from '../enums';

export const ACTIVITY = {
  [LANGUAGES.english]: {
    ERROR_MSG:
      "Your phone (or, maybe, you) shuted our app in the background. Don't worry, we do our best to recover state of your activity.Note, that activity is paused, so you have to continue manually",
    GETTING_POSITION: 'Getting your position...',
    PAUSE_BTN: 'Resume',
  },
  [LANGUAGES.russian]: {
    PAUSE_BTN: 'Продолжить',
  },
};
