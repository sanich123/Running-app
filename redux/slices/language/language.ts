import { createSlice } from '@reduxjs/toolkit';
import { LANGUAGES } from '@const/enums';

export const LANGUAGE_INITIAL_STATE = {
  language: LANGUAGES.russian,
  theme: null,
};

const language = createSlice({
  name: 'language',
  initialState: LANGUAGE_INITIAL_STATE,
  reducers: {
    changeLanguage: (state, action) => {
      state.language = action.payload;
    },
    changeTheme: (state, action) => {
      state.theme = action.payload;
    },
    resetLanguageSlice: () => {
      return LANGUAGE_INITIAL_STATE;
    },
  },
});

export const { changeLanguage, changeTheme, resetLanguageSlice } = language.actions;
export default language.reducer;
