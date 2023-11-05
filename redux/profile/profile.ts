import { createSlice } from '@reduxjs/toolkit';

export const PROFILE_INITIAL_STATE = {
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

export const profile = createSlice({
  name: 'profile',
  initialState: PROFILE_INITIAL_STATE,

  reducers: {
    saveSettingsInfo: (state, action) => {
      state.settings = action.payload;
    },
    saveEmailPassword: (state, action) => {
      state.privateInfo = action.payload;
    },
    setIsDisabledWhileSendingProfile: (state, action) => {
      state.isDisabledWhileSendingProfile = action.payload;
    },
  },
});

export const { saveSettingsInfo, saveEmailPassword, setIsDisabledWhileSendingProfile } = profile.actions;
export default profile.reducer;
