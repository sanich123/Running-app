import { createSlice } from '@reduxjs/toolkit';

const mainFeed = createSlice({
  name: 'mainFeed',
  initialState: {
    activityIdWhichCommentsToUpdate: '',
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
  },
});

export const {
  setActivityIdWhichCommentsToUpdate,
  setActivityIdWhichLikesToDownload,
  setActivityIdWhichLikesToUpdate,
} = mainFeed.actions;

export default mainFeed.reducer;
