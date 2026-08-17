import { createSlice } from '@reduxjs/toolkit';
import { ADDITIONAL_INFO_INITIAL_STATE } from './const';

const additionalInfoActivity = createSlice({
  name: 'additionalInfoActivity',
  initialState: ADDITIONAL_INFO_INITIAL_STATE,
  reducers: {
    saveTitle: (state, { payload }) => {
      state.title = payload;
    },
    saveDescription: (state, { payload }) => {
      state.description = payload;
    },
    saveSport: (state, { payload }) => {
      state.sport = payload;
    },
    saveEmotion: (state, { payload }) => {
      state.emotion = payload;
    },
    saveIsPublic: (state, { payload }) => {
      state.isPublic = payload;
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
    resetPhotoUrls: (state) => {
      state.photoVideoUrls = [];
    },
    resetAdditionalInfoActivitySlice: () => {
      return ADDITIONAL_INFO_INITIAL_STATE;
    },
  },
});

export const {
  saveTitle,
  saveDescription,
  saveSport,
  saveEmotion,
  saveIsPublic,
  addPhotoUrl,
  addPhotoUrls,
  deletePhotoUrl,
  resetAdditionalInfoActivitySlice,
} = additionalInfoActivity.actions;

export default additionalInfoActivity.reducer;
