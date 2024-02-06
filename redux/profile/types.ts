export type ProfilePrivateInfo = {
  email: string;
  password: string;
};

export type ProfileSettings = {
  gender: string;
  name: string;
  surname: string;
  city: string;
  weight: string;
  bio: string;
  profilePhoto: string;
};

export type ProfileSlice = {
  privateInfo: ProfilePrivateInfo;
  isDisabledWhileSendingProfile: boolean;
  isNeedToPrefetchActivities: boolean;
  settings: ProfileSettings;
};
