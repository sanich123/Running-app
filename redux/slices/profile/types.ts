import type { ProfileType } from '@S/card/types';

export interface ProfilePrivateInfo {
  email: string;
  password: string;
}

export interface ProfileSettings {
  gender?: string;
  name?: string;
  surname?: string;
  city?: string;
  weight?: string;
  bio?: string;
  profilePhoto?: string;
  email?: string;
  birthday?: string;
  sport?: string;
  emailNotifications?: boolean;
}

export interface ProfileSlice {
  privateInfo: ProfilePrivateInfo;
  isDisabledWhileSendingProfile: boolean;
  isNeedToPrefetchActivities: boolean;
  settings: ProfileSettings;
  profileFromServer: ProfileType;
}
