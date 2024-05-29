import { createSlice } from '@reduxjs/toolkit';

export const mainFeed = createSlice({
  name: 'mainFeed',
  initialState: {
    activityIdWhichCommentsToUpdate: '',
    commentIdWhichLikesToUpdate: '',
    needToRefreshActivities: false,
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
  },
});

export const { setActivityIdWhichCommentsToUpdate, setIsNeedToRefreshActivities, setCommentIdWhichLikesToUpdate } =
  mainFeed.actions;

export default mainFeed.reducer;
