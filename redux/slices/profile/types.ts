import type { ProfileType } from '@S/card/types';

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
  privateInfo: { email: string; password: string };
  isDisabledWhileSendingProfile: boolean;
  settings: Pick<ProfileSettings, 'profilePhoto'>;
  profileFromServer: ProfileType;
}
