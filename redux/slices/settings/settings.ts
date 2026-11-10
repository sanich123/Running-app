import { createSlice } from '@reduxjs/toolkit';
import { SETTINGS_INITIAL_STATE } from './types';

const settings = createSlice({
  name: 'settings',
  initialState: SETTINGS_INITIAL_STATE,
  reducers: {
    changeLanguage: (state, action) => {
      state.language = action.payload;
    },
    changeTheme: (state, action) => {
      state.theme = action.payload;
    },
    setIsProfileFilled: (state, action) => {
      state.isProfileFilled = action.payload;
    },
  },
});

export const { changeLanguage, changeTheme, setIsProfileFilled } = settings.actions;
export default settings.reducer;
