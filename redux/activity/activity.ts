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
  },
});

export const { saveActivity, setIsNeedToSendActivity, setIsNeedToSaveActivity } = activity.actions;
export default activity.reducer;
