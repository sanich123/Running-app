import { ProfileType } from '@C/card/types';

export type ProfilePrivateInfo = {
  email: string;
  password: string;
};

export type ProfileSettings = {
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
};

export type ProfileGoogle = {
  id: string;
  name: string | null;
  email: string;
  photo: string | null;
  familyName: string | null;
  givenName: string | null;
};

export type ProfileSlice = {
  privateInfo: ProfilePrivateInfo;
  googleInfo: ProfileGoogle;
  isDisabledWhileSendingProfile: boolean;
  isNeedToPrefetchActivities: boolean;
  settings: ProfileSettings;
  profileFromServer: ProfileType;
};
