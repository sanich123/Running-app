import { LANGUAGES } from '@const/enums';

export const ACTIVITY_MOTION_STATUS = {
  [LANGUAGES.english]: {
    title: 'No movement detected',
    description: 'Your phone does not detect movement. Tracking is still running.',
  },
  [LANGUAGES.russian]: {
    title: 'Похоже, вы остановились',
    description: 'Телефон не обнаруживает движения. Отслеживание продолжает работать.',
  },
} as const;
