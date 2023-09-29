import { createSlice } from '@reduxjs/toolkit';

export const userInfoSlice = createSlice({
  name: 'userInfoSlice',
  initialState: {
    privateInfo: {
      email: '',
      password: '',
    },
    isNeedToUpdateSettings: false,
    settings: {
      gender: '',
      sport: '',
      name: '',
      surname: '',
      city: '',
      weight: '',
      bio: '',
      profilePhoto: '',
      birthday: '',
    },
  },

  reducers: {
    saveSettingsInfo: (state, action) => {
      state.settings = action.payload;
    },
    saveEmailPassword: (state, action) => {
      state.privateInfo = action.payload;
    },
    setIsNeedUpdateProfile: (state, action) => {
      state.isNeedToUpdateSettings = action.payload;
    },
  },
});

export const { saveSettingsInfo, saveEmailPassword, setIsNeedUpdateProfile } = userInfoSlice.actions;
export default userInfoSlice.reducer;
