import { createSlice } from '@reduxjs/toolkit';
import type { ProfileType } from '@S/card/types';

const comment = createSlice({
  name: 'comment',
  initialState: {
    commentActivityId: '',
    idOfUpdatingComment: '',
    commentToUpdate: '',
    activityOwnerProfile: {} as ProfileType,
    mapPhotoUrl: '',
    commentsLength: 0,
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
    setMapPhotoUrl: (state, { payload }) => {
      state.mapPhotoUrl = payload;
    },
    setCommentsLength: (state, { payload }) => {
      state.commentsLength = payload;
    },
  },
});

export const {
  setCommentActivityId,
  setActivityOwnerProfile,
  setIdOfUpdatingComment,
  setCommentToUpdate,
  setMapPhotoUrl,
  setCommentsLength,
} = comment.actions;
export default comment.reducer;
