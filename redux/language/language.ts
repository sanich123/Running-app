import { createSlice } from '@reduxjs/toolkit';

import { LANGUAGES } from '../../constants/enums';

export const language = createSlice({
  name: 'language',
  initialState: {
    language: LANGUAGES.english,
  },
  reducers: {
    changeLanguage: (state, action) => {
      state.language = action.payload;
    },
  },
});

export const { changeLanguage } = language.actions;
export default language.reducer;
