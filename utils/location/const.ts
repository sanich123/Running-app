import { LANGUAGES } from '@const/enums';
import type { LocationObject } from 'expo-location';
import type * as TaskManager from 'expo-task-manager';

export const LOCATION_TRACKING = 'location-tracking';

export interface TaskManagerLocationEvent {
  data: { locations: LocationObject[] };
  error: TaskManager.TaskManagerError | null;
}

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

export const TIME_INTERVAL = 3000;
export const DISTANCE_INTERVAL = 10;
export const MAX_ACTIVITY_LOCATIONS = 5000;
export const MAX_SAVED_ROUTE_LOCATIONS = 1000;
