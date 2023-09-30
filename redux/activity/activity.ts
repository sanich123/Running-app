import { createSlice } from '@reduxjs/toolkit';

export const activity = createSlice({
  name: 'activity',
  initialState: {
    isNeedToSave: false,
    isNeedToSend: false,
    activityToSend: {
      locations: [] as Location[],
      duration: 0,
      speed: 0,
      distance: 0,
      title: '',
      description: '',
      sport: '',
      emotion: '',
      isSwitchOn: false,
      photoUrls: [] as string[],
    },
  },
  reducers: {
    setIsNeedToSendActivity: (state, action) => {
      state.isNeedToSend = action.payload;
    },
    setIsNeedToSaveActivity: (state, action) => {
      state.isNeedToSave = action.payload;
    },
    saveActivity: (state, action) => {
      state.activityToSend = action.payload;
    },
    saveTitle: (state, action) => {
      state.activityToSend.title = action.payload;
    },
    saveDescription: (state, action) => {
      state.activityToSend.description = action.payload;
    },
    saveSport: (state, action) => {
      state.activityToSend.sport = action.payload;
    },
    saveEmotion: (state, action) => {
      state.activityToSend.emotion = action.payload;
    },
    saveIsSwitchOn: (state, action) => {
      state.activityToSend.isSwitchOn = action.payload;
    },
    savePhotoUrls: (state, action) => {
      state.activityToSend.photoUrls = action.payload;
    },
  },
});

export const {
  saveActivity,
  setIsNeedToSendActivity,
  setIsNeedToSaveActivity,
  saveTitle,
  saveDescription,
  saveSport,
  saveEmotion,
  saveIsSwitchOn,
  savePhotoUrls,
} = activity.actions;
export default activity.reducer;
