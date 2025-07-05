import { LANGUAGES } from '@const/enums';
import { createSlice } from '@reduxjs/toolkit';

export const LANGUAGE_INITIAL_STATE = {
  language: LANGUAGES.russian,
  theme: null,
};

export const language = createSlice({
  name: 'language',
  initialState: LANGUAGE_INITIAL_STATE,
  reducers: {
    changeLanguage: (state, action) => {
      state.language = action.payload;
    },
    changeTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
});

export const { changeLanguage, changeTheme } = language.actions;
export default language.reducer;
