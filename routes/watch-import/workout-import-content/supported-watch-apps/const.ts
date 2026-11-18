export type DataAvailability = 'yes' | 'no' | 'partial' | 'unknown';

export interface AppSupport {
  name: string;
  workout: DataAvailability;
  route: DataAvailability;
  heartRate: DataAvailability;
}

export const WATCH_APP_STATUS_WARNING_COLORS = {
  light: 'rgb(156, 96, 0)',
  dark: 'rgb(255, 214, 102)',
} as const;

export const SUPPORTED_WATCH_APPS: Record<'ios' | 'android', { direct: AppSupport[]; healthSync: string[] }> = {
  ios: {
    direct: [
      { name: 'Apple Watch', workout: 'yes', route: 'yes', heartRate: 'yes' },
      { name: 'Google Health · Fitbit', workout: 'yes', route: 'yes', heartRate: 'yes' },
      { name: 'Zepp · Amazfit', workout: 'yes', route: 'yes', heartRate: 'yes' },
      { name: 'Garmin Connect', workout: 'yes', route: 'no', heartRate: 'partial' },
      { name: 'Suunto', workout: 'yes', route: 'no', heartRate: 'no' },
      { name: 'Polar Flow', workout: 'yes', route: 'unknown', heartRate: 'yes' },
      { name: 'COROS', workout: 'unknown', route: 'unknown', heartRate: 'unknown' },
      { name: 'HUAWEI Health', workout: 'unknown', route: 'unknown', heartRate: 'unknown' },
    ],
    healthSync: [
      'COROS',
      'Garmin Connect',
      'HUAWEI Health',
      'Google Health (Fitbit)',
      'Oura',
      'Polar Flow',
      'Strava',
      'Suunto',
    ],
  },
  android: {
    direct: [
      { name: 'Google Health · Fitbit / Pixel Watch', workout: 'yes', route: 'yes', heartRate: 'yes' },
      { name: 'Zepp · Amazfit', workout: 'yes', route: 'yes', heartRate: 'yes' },
      { name: 'Mi Fitness · Xiaomi', workout: 'yes', route: 'yes', heartRate: 'yes' },
      { name: 'Polar Flow', workout: 'yes', route: 'yes', heartRate: 'yes' },
      { name: 'Samsung Health', workout: 'yes', route: 'no', heartRate: 'yes' },
      { name: 'Garmin Connect', workout: 'yes', route: 'no', heartRate: 'yes' },
      { name: 'Strava', workout: 'yes', route: 'no', heartRate: 'unknown' },
      { name: 'COROS', workout: 'unknown', route: 'unknown', heartRate: 'unknown' },
    ],
    healthSync: [
      'COROS',
      'Garmin Connect',
      'HUAWEI Health',
      'Google Health (Fitbit)',
      'Oura',
      'Polar Flow',
      'Samsung Health',
      'Strava',
      'Suunto',
      'Withings',
    ],
  },
};
