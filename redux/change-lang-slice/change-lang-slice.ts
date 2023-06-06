import { createSlice } from '@reduxjs/toolkit';

export const changeThemeLang = createSlice({
  name: 'changeThemeLang',
  initialState: {
    language: 'en',
    theme: 'light',
  },
  reducers: {
    changeLanguage: (state) => {
      state.language = state.language === 'ru' ? 'en' : 'ru';
    },
    changeTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const { changeLanguage, changeTheme } = changeThemeLang.actions;
export default changeThemeLang.reducer;
