import { ProfileSlice } from './types';

export const PROFILE_INITIAL_STATE: ProfileSlice = {
  privateInfo: {
    email: '',
    password: '',
  },
  isDisabledWhileSendingProfile: false,
  settings: {
    gender: '',
    name: '',
    surname: '',
    city: '',
    weight: '',
    bio: '',
    profilePhoto: '',
  },
};
