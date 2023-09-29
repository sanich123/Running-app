import { createSlice } from '@reduxjs/toolkit';

export const activity = createSlice({
  name: 'activity',
  initialState: {
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
      isSwitchOn: '',
      photoUrls: [] as string[],
    },
  },
  reducers: {
    setIsNeedToSendActivity: (state, action) => {
      state.isNeedToSend = action.payload;
    },
    saveActivity: (state, action) => {
      state.activityToSend = action.payload;
    },
  },
});

export const { saveActivity, setIsNeedToSendActivity } = activity.actions;
export default activity.reducer;
