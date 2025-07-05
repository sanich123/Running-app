import { ProfileSettings } from '@R/slices/profile/types';

export type SendProfile = {
  body: ProfileSettings;
  id: string;
};
