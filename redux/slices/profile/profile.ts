import { createSlice } from '@reduxjs/toolkit';
import { PROFILE_INITIAL_STATE, PROFILE_SETTINGS_INITIAL_STATE } from './const';

const profile = createSlice({
  name: 'profile',
  initialState: PROFILE_INITIAL_STATE,
  reducers: {
    setIsDisabledWhileSendingProfile: (state, action) => {
      state.isDisabledWhileSendingProfile = action.payload;
    },
    savePhotoUrl: (state, action) => {
      state.settings.profilePhoto = action.payload;
    },
    resetSettings: (state) => {
      state.settings = PROFILE_SETTINGS_INITIAL_STATE;
    },
    saveWholeProfile: (state, action) => {
      state.profileFromServer = action.payload;
    },
    saveProfilePreview: (state, action) => {
      state.profileFromServer = { ...state.profileFromServer, ...action.payload };
    },
  },
});

export const { setIsDisabledWhileSendingProfile, savePhotoUrl, resetSettings, saveWholeProfile, saveProfilePreview } =
  profile.actions;

export default profile.reducer;
