import { createSlice } from '@reduxjs/toolkit';

const mainFeed = createSlice({
  name: 'mainFeed',
  initialState: {
    activityIdWhichCommentsToUpdate: '',
    needToRefreshActivities: false,
    activityIdWhichLikesToDownload: '',
  },
  reducers: {
    setActivityIdWhichCommentsToUpdate: (state, action) => {
      state.activityIdWhichCommentsToUpdate = action.payload;
    },
    setActivityIdWhichLikesToDownload: (state, action) => {
      state.activityIdWhichLikesToDownload = action.payload;
    },
    resetMainFeedSlice: () => {
      return {
        activityIdWhichCommentsToUpdate: '',
        needToRefreshActivities: false,
        activityIdWhichLikesToDownload: '',
      };
    },
  },
});

export const { setActivityIdWhichCommentsToUpdate, setActivityIdWhichLikesToDownload, resetMainFeedSlice } =
  mainFeed.actions;

export default mainFeed.reducer;
