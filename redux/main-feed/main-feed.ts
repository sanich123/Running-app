import { createSlice } from '@reduxjs/toolkit';

export const mainFeed = createSlice({
  name: 'mainFeed',
  initialState: {
    activityIdWhichLikesToUpdate: '',
    activityIdWhichCommentsToUpdate: '',
    needToRefreshActivities: false,
  },
  reducers: {
    setActivityIdWhichLikesToUpdate: (state, action) => {
      state.activityIdWhichLikesToUpdate = action.payload;
    },
    setActivityIdWhichCommentsToUpdate: (state, action) => {
      state.activityIdWhichCommentsToUpdate = action.payload;
    },
    setIsNeedToRefreshActivities: (state, action) => {
      state.needToRefreshActivities = action.payload;
    },
  },
});

export const { setActivityIdWhichLikesToUpdate, setActivityIdWhichCommentsToUpdate, setIsNeedToRefreshActivities } =
  mainFeed.actions;

export default mainFeed.reducer;
