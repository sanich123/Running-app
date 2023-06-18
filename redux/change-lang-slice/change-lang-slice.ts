import { createSlice } from '@reduxjs/toolkit';
import { LANGUAGES } from '../../constants/enums';

export const changeThemeLang = createSlice({
  name: 'changeThemeLang',
  initialState: {
    language: LANGUAGES.english,
    theme: 'light',
  },
  reducers: {
    changeLanguage: (state) => {
      state.language = state.language === LANGUAGES.russian ? LANGUAGES.english : LANGUAGES.russian;
    },
    changeTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const { changeLanguage, changeTheme } = changeThemeLang.actions;
export default changeThemeLang.reducer;
