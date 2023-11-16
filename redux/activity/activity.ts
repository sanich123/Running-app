import { createSlice } from '@reduxjs/toolkit';

export const ACTIVITY_INITIAL_STATE = {
  isNeedToResetInputs: false,
  isDisabledWhileSending: false,
  isHaveUnsyncedActivity: false,
  isManualAdding: false,
  additionalInfo: {
    title: '',
    description: '',
    sport: '',
    emotion: '',
    isSwitchOn: false,
    photoUrls: [] as string[],
  },
  unsyncedActivities: [],
};

export const activity = createSlice({
  name: 'activity',
  initialState: ACTIVITY_INITIAL_STATE,
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
    resetActivityInfo: (state) => {
      state.additionalInfo = {
        title: '',
        description: '',
        sport: '',
        emotion: '',
        isSwitchOn: false,
        photoUrls: [] as string[],
      };
    },
    setIsNeedToResetInputs: (state, action) => {
      state.isNeedToResetInputs = action.payload;
    },
    saveUnsendedActivity: (state, action) => {
      state.unsyncedActivities = [...state.unsyncedActivities, action.payload];
    },
    refreshUnsendedActivitiesList: (state, action) => {
      state.unsyncedActivities = action.payload;
    },
    setIsHaveUnsyncedActivity: (state, action) => {
      state.isHaveUnsyncedActivity = action.payload;
    },
    setIsManualAdding: (state, action) => {
      state.isManualAdding = action.payload;
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
  resetActivityInfo,
  setIsNeedToResetInputs,
  saveUnsendedActivity,
  setIsHaveUnsyncedActivity,
  refreshUnsendedActivitiesList,
  setIsManualAdding,
} = activity.actions;
export default activity.reducer;
