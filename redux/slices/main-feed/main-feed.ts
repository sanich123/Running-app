import { createSlice } from '@reduxjs/toolkit';

export const mainFeed = createSlice({
  name: 'mainFeed',
  initialState: {
    activityIdWhichCommentsToUpdate: '',
    commentIdWhichLikesToUpdate: '',
    needToRefreshActivities: false,
    activityIdWhichLikesToDownload: '',
  },
  reducers: {
    setActivityIdWhichCommentsToUpdate: (state, action) => {
      state.activityIdWhichCommentsToUpdate = action.payload;
    },
    setCommentIdWhichLikesToUpdate: (state, action) => {
      state.commentIdWhichLikesToUpdate = action.payload;
    },
    setActivityIdWhichLikesToDownload: (state, action) => {
      state.activityIdWhichLikesToDownload = action.payload;
    },
    resetMainFeedSlice: () => {
      return {
        activityIdWhichCommentsToUpdate: '',
        commentIdWhichLikesToUpdate: '',
        needToRefreshActivities: false,
        activityIdWhichLikesToDownload: '',
      };
    },
  },
});

export const {
  setActivityIdWhichCommentsToUpdate,
  setCommentIdWhichLikesToUpdate,
  setActivityIdWhichLikesToDownload,
  resetMainFeedSlice,
} = mainFeed.actions;

export default mainFeed.reducer;
