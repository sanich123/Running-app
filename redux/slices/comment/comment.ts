import { ProfileType } from '@C/card/types';
import { createSlice } from '@reduxjs/toolkit';

export const comment = createSlice({
  name: 'comment',
  initialState: {
    commentActivityId: '',
    isShowingTextInput: false,
    idOfUpdatingComment: '',
    activityOwnerProfile: {} as ProfileType,
    mapPhotoUrl: '',
  },
  reducers: {
    setCommentActivityId: (state, { payload }) => {
      state.commentActivityId = payload;
    },
    setActivityOwnerProfile: (state, { payload }) => {
      state.activityOwnerProfile = payload;
    },
    setIsShowingTextInput: (state, { payload }) => {
      state.isShowingTextInput = payload;
    },
    setIdOfUpdatingComment: (state, { payload }) => {
      state.idOfUpdatingComment = payload;
    },
    setMapPhotoUrl: (state, { payload }) => {
      state.mapPhotoUrl = payload;
    },
  },
});

export const {
  setCommentActivityId,
  setActivityOwnerProfile,
  setIsShowingTextInput,
  setIdOfUpdatingComment,
  setMapPhotoUrl,
} = comment.actions;
export default comment.reducer;
