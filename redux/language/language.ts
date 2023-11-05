import { createSlice } from '@reduxjs/toolkit';

import { LANGUAGES } from '../../constants/enums';

export const LANGUAGE_INITIAL_STATE = {
  language: LANGUAGES.english,
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
