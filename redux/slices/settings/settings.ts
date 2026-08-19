import { createSlice } from '@reduxjs/toolkit';
import { LANGUAGES } from '@const/enums';

export const SETTINGS_INITIAL_STATE = {
  language: LANGUAGES.russian,
  theme: null as 'light' | 'dark' | null,
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
  },
});

export const { changeLanguage, changeTheme } = settings.actions;
export default settings.reducer;
