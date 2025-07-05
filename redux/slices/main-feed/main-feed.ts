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
    setIsNeedToRefreshActivities: (state, action) => {
      state.needToRefreshActivities = action.payload;
    },
    setCommentIdWhichLikesToUpdate: (state, action) => {
      state.commentIdWhichLikesToUpdate = action.payload;
    },
    setActivityIdWhichLikesToDownload: (state, action) => {
      state.activityIdWhichLikesToDownload = action.payload;
    },
  },
});

export const {
  setActivityIdWhichCommentsToUpdate,
  setIsNeedToRefreshActivities,
  setCommentIdWhichLikesToUpdate,
  setActivityIdWhichLikesToDownload,
} = mainFeed.actions;

export default mainFeed.reducer;
