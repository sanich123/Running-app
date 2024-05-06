import { LANGUAGES } from '@const/enums';
import { createSlice } from '@reduxjs/toolkit';

export const LANGUAGE_INITIAL_STATE = {
  language: LANGUAGES.russian,
};

export const language = createSlice({
  name: 'language',
  initialState: LANGUAGE_INITIAL_STATE,
  reducers: {
    changeLanguage: (state, action) => {
      state.language = action.payload;
    },
  },
});

export const { changeLanguage } = language.actions;
export default language.reducer;
