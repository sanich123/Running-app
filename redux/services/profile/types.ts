import type { ProfileSettings } from '@R/slices/profile/types';

export interface SendProfile {
  body: ProfileSettings;
  id: string;
}
