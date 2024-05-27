import { createSlice } from '@reduxjs/toolkit';

export const mainFeed = createSlice({
  name: 'mainFeed',
  initialState: {
    activityIdWhichCommentsToUpdate: '',
    needToRefreshActivities: false,
  },
  reducers: {
    setActivityIdWhichCommentsToUpdate: (state, action) => {
      state.activityIdWhichCommentsToUpdate = action.payload;
    },
    setIsNeedToRefreshActivities: (state, action) => {
      state.needToRefreshActivities = action.payload;
    },
  },
});

export const { setActivityIdWhichCommentsToUpdate, setIsNeedToRefreshActivities } = mainFeed.actions;

export default mainFeed.reducer;
