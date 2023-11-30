import { LANGUAGES } from '@const/enums';
import { LocationObject } from 'expo-location';
import * as TaskManager from 'expo-task-manager';

export const LOCATION_TRACKING = 'location-tracking';

export type TaskManagerLocationEvent = {
  data: { locations: LocationObject[] };
  error: TaskManager.TaskManagerError | null;
};

export const BACKGROUND_NOTIFICATION = {
  [LANGUAGES.english]: {
    isActive: 'Runich is active',
    turnOff: 'To turn off, go back to the app and switch something off.',
  },
  [LANGUAGES.russian]: {
    isActive: 'Runich активен и работает в бэкграунде',
    turnOff: 'Чтобы выключить надо зайти в приложение и выключить его',
  },
};
