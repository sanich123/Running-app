import { createSlice } from '@reduxjs/toolkit';
import type { ProfileType } from '@S/card/types';

const comment = createSlice({
  name: 'comment',
  initialState: {
    commentActivityId: '',
    idOfUpdatingComment: '',
    commentToUpdate: '',
    activityOwnerProfile: {} as ProfileType,
  },
  reducers: {
    setCommentActivityId: (state, { payload }) => {
      state.commentActivityId = payload;
    },
    setActivityOwnerProfile: (state, { payload }) => {
      state.activityOwnerProfile = payload;
    },
    setIdOfUpdatingComment: (state, { payload }) => {
      state.idOfUpdatingComment = payload;
    },
    setCommentToUpdate: (state, { payload }) => {
      state.commentToUpdate = payload;
    },
  },
});

export const { setCommentActivityId, setActivityOwnerProfile, setIdOfUpdatingComment, setCommentToUpdate } =
  comment.actions;
export default comment.reducer;
