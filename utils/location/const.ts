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
    isActive: 'Recording your workout',
    turnOff: 'Your route is recorded while Runich is in the background. Stop recording in the app.',
  },
  [LANGUAGES.russian]: {
    isActive: 'Идёт запись тренировки',
    turnOff: 'Маршрут записывается, пока приложение свёрнуто. Остановить запись можно в приложении.',
  },
};

export const TIME_INTERVAL = 3000;
export const DISTANCE_INTERVAL = 10;
export const MAX_ACTIVITY_LOCATIONS = 1000;
export const MAX_RAW_ACTIVITY_LOCATIONS = 100_000;
export const MAX_SAVED_ROUTE_LOCATIONS = MAX_ACTIVITY_LOCATIONS;
