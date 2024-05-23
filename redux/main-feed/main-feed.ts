import { createSlice } from '@reduxjs/toolkit';

export const mainFeed = createSlice({
  name: 'mainFeed',
  initialState: {
    activityIdWhichLikesToUpdate: '',
    activityIdWhichCommentsToUpdate: '',
  },
  reducers: {
    setActivityIdWhichLikesToUpdate: (state, action) => {
      state.activityIdWhichLikesToUpdate = action.payload;
    },
    setActivityIdWhichCommentsToUpdate: (state, action) => {
      state.activityIdWhichCommentsToUpdate = action.payload;
    },
  },
});

export const { setActivityIdWhichLikesToUpdate, setActivityIdWhichCommentsToUpdate } = mainFeed.actions;

export default mainFeed.reducer;
