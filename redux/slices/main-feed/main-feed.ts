import { createSlice } from '@reduxjs/toolkit';

const mainFeed = createSlice({
  name: 'mainFeed',
  initialState: {
    activityIdWhichLikesToDownload: '',
    activityIdWhichLikesToUpdate: '',
  },
  reducers: {
    setActivityIdWhichLikesToDownload: (state, action) => {
      state.activityIdWhichLikesToDownload = action.payload;
    },
    setActivityIdWhichLikesToUpdate: (state, action) => {
      state.activityIdWhichLikesToUpdate = action.payload;
    },
  },
});

export const { setActivityIdWhichLikesToDownload, setActivityIdWhichLikesToUpdate } = mainFeed.actions;

export default mainFeed.reducer;
