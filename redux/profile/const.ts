import { ProfileSlice } from './types';

export const PROFILE_SETTINGS_INITIAL_STATE = {
  gender: '',
  name: '',
  surname: '',
  city: '',
  weight: '',
  bio: '',
  profilePhoto: '',
};

export const PROFILE_INITIAL_STATE: ProfileSlice = {
  privateInfo: {
    email: '',
    password: '',
  },
  googleInfo: {
    id: '',
    email: '',
    familyName: '',
    givenName: '',
    name: '',
    photo: '',
  },
  isDisabledWhileSendingProfile: false,
  settings: PROFILE_SETTINGS_INITIAL_STATE,
  isNeedToPrefetchActivities: true,
};
