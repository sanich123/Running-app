import { createSlice } from '@reduxjs/toolkit';

const mainFeed = createSlice({
  name: 'mainFeed',
  initialState: {
    activityIdWhichCommentsToUpdate: '',
    needToRefreshActivities: false,
    activityIdWhichLikesToDownload: '',
    activityIdWhichLikesToUpdate: '',
  },
  reducers: {
    setActivityIdWhichCommentsToUpdate: (state, action) => {
      state.activityIdWhichCommentsToUpdate = action.payload;
    },
    setActivityIdWhichLikesToDownload: (state, action) => {
      state.activityIdWhichLikesToDownload = action.payload;
    },
    setActivityIdWhichLikesToUpdate: (state, action) => {
      state.activityIdWhichLikesToUpdate = action.payload;
    },
    resetMainFeedSlice: () => {
      return {
        activityIdWhichCommentsToUpdate: '',
        needToRefreshActivities: false,
        activityIdWhichLikesToDownload: '',
        activityIdWhichLikesToUpdate: '',
      };
    },
  },
});

export const {
  setActivityIdWhichCommentsToUpdate,
  setActivityIdWhichLikesToDownload,
  setActivityIdWhichLikesToUpdate,
  resetMainFeedSlice,
} = mainFeed.actions;

export default mainFeed.reducer;
