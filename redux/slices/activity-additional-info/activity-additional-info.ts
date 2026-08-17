import { createSlice } from '@reduxjs/toolkit';
import { ADDITIONAL_INFO_INITIAL_STATE } from './const';

const additionalInfoActivity = createSlice({
  name: 'additionalInfoActivity',
  initialState: ADDITIONAL_INFO_INITIAL_STATE,
  reducers: {
    saveSport: (state, { payload }) => {
      state.sport = payload;
    },
    addPhotoUrl: (state, { payload }) => {
      state.photoVideoUrls = [payload, ...state.photoVideoUrls];
    },
    addPhotoUrls: (state, { payload }) => {
      state.photoVideoUrls = [...payload, ...state.photoVideoUrls];
    },
    deletePhotoUrl: (state, { payload }) => {
      state.photoVideoUrls = state.photoVideoUrls.filter(({ url }) => url !== payload);
    },
    resetAdditionalInfoActivitySlice: () => {
      return ADDITIONAL_INFO_INITIAL_STATE;
    },
  },
});

export const { saveSport, addPhotoUrl, addPhotoUrls, deletePhotoUrl, resetAdditionalInfoActivitySlice } =
  additionalInfoActivity.actions;

export default additionalInfoActivity.reducer;
