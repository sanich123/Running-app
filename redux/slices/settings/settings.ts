import { createSlice } from '@reduxjs/toolkit';
import { LANGUAGES } from '@const/enums';

export const SETTINGS_INITIAL_STATE = {
  language: LANGUAGES.russian,
  theme: null as 'light' | 'dark' | null,
  isProfileFilled: false,
};

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
