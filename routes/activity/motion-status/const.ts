import { LANGUAGES } from '@const/enums';

export const ACTIVITY_MOTION_STATUS = {
  [LANGUAGES.english]: {
    title: 'No movement detected',
    description: 'Your phone does not detect movement. Tracking is still running.',
    basedOn: (sources: string) => `Based on: ${sources}.`,
    sources: {
      accelerometer: 'accelerometer',
      gps: 'GPS',
      pedometer: 'step counter',
    },
  },
  [LANGUAGES.russian]: {
    title: 'Похоже, вы остановились',
    description: 'Телефон не обнаруживает движения. Отслеживание продолжает работать.',
    basedOn: (sources: string) => `Вывод сделан на основании: ${sources}.`,
    sources: {
      accelerometer: 'акселерометра',
      gps: 'GPS',
      pedometer: 'шагомера',
    },
  },
} as const;
