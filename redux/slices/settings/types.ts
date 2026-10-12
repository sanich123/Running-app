import type { LANGUAGES } from '@const/enums';

export type ActivityVoiceMetric = 'pace' | 'movingTime' | 'elevation';

export interface ActivityReminder {
  id: string;
  intervalMinutes: number;
  text: string;
}

export interface ActivitySettings {
  language: LANGUAGES;
  theme: 'light' | 'dark' | null;
  isProfileFilled: boolean;
  activityVoiceEnabled: boolean;
  activityVoiceMetrics: ActivityVoiceMetric[];
  activityVoiceIdentifier: string | null;
  activityReminderEnabled: boolean;
  activityReminders: ActivityReminder[];
  saveCameraPhotosToGallery: boolean;
}
