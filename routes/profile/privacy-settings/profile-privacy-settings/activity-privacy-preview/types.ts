import type { LANGUAGES } from '@const/enums';

export type ActivityPrivacyMetric = 'heartRate' | 'elevation' | 'pace';

export interface ActivityPrivacyPreviewProps {
  allowActivityInteractions: boolean;
  allowActivityReplayViewing: boolean;
  allowActivityHeartRateViewing: boolean;
  allowActivityElevationViewing: boolean;
  allowActivityPaceViewing: boolean;
  allowActivitySharing: boolean;
  language: LANGUAGES;
}
