import { createSlice } from '@reduxjs/toolkit';

export const activity = createSlice({
  name: 'activity',
  initialState: {
    isDisabledWhileSending: false,
    additionalInfo: {
      title: '',
      description: '',
      sport: '',
      emotion: '',
      isSwitchOn: false,
      photoUrls: [] as string[],
    },
  },
  reducers: {
    saveTitle: (state, action) => {
      state.additionalInfo.title = action.payload;
    },
    saveDescription: (state, action) => {
      state.additionalInfo.description = action.payload;
    },
    saveSport: (state, action) => {
      state.additionalInfo.sport = action.payload;
    },
    saveEmotion: (state, action) => {
      state.additionalInfo.emotion = action.payload;
    },
    saveIsSwitchOn: (state, action) => {
      state.additionalInfo.isSwitchOn = action.payload;
    },
    savePhotoUrls: (state, action) => {
      state.additionalInfo.photoUrls = action.payload;
    },
    setIsDisableWhileSending: (state, action) => {
      state.isDisabledWhileSending = action.payload;
    },
  },
});

export const {
  saveTitle,
  saveDescription,
  saveSport,
  saveEmotion,
  saveIsSwitchOn,
  savePhotoUrls,
  setIsDisableWhileSending,
} = activity.actions;
export default activity.reducer;
