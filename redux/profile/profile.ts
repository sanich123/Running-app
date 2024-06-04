import { createSlice } from '@reduxjs/toolkit';

import { PROFILE_INITIAL_STATE, PROFILE_SETTINGS_INITIAL_STATE } from './const';

export const profile = createSlice({
  name: 'profile',
  initialState: PROFILE_INITIAL_STATE,
  reducers: {
    saveEmailPassword: (state, action) => {
      state.privateInfo = action.payload;
    },
    setIsDisabledWhileSendingProfile: (state, action) => {
      state.isDisabledWhileSendingProfile = action.payload;
    },
    savePhotoUrl: (state, action) => {
      state.settings.profilePhoto = action.payload;
    },
    saveName: (state, action) => {
      state.settings.name = action.payload;
    },
    saveSurname: (state, action) => {
      state.settings.surname = action.payload;
    },
    saveWeight: (state, action) => {
      state.settings.weight = action.payload;
    },
    saveCity: (state, action) => {
      state.settings.city = action.payload;
    },
    saveBio: (state, action) => {
      state.settings.bio = action.payload;
    },
    saveGender: (state, action) => {
      state.settings.gender = action.payload;
    },
    resetSettings: (state) => {
      state.settings = PROFILE_SETTINGS_INITIAL_STATE;
    },
    setisNeedToPrefetchActivities: (state) => {
      state.isNeedToPrefetchActivities = !state.isNeedToPrefetchActivities;
    },
    saveGoogleProfileInfo: (state, action) => {
      state.googleInfo = action.payload;
    },
    saveWholeProfile: (state, action) => {
      state.profileFromServer = action.payload;
    },
  },
});

export const {
  saveEmailPassword,
  setIsDisabledWhileSendingProfile,
  savePhotoUrl,
  saveName,
  saveSurname,
  saveWeight,
  saveCity,
  saveBio,
  saveGender,
  resetSettings,
  setisNeedToPrefetchActivities,
  saveGoogleProfileInfo,
  saveWholeProfile,
} = profile.actions;

export default profile.reducer;
