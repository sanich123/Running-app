import { createSlice } from '@reduxjs/toolkit';

import { LANGUAGES } from '../../constants/enums';

const { russian, english } = LANGUAGES;

export const language = createSlice({
  name: 'language',
  initialState: {
    language: english,
  },
  reducers: {
    changeLanguage: (state) => {
      state.language = state.language === russian ? english : russian;
    },
  },
});

export const { changeLanguage } = language.actions;
export default language.reducer;
