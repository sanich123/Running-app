import { createSlice } from '@reduxjs/toolkit';
import { AUTH_INITIAL_STATE } from './const';

const auth = createSlice({
  name: 'auth',
  initialState: AUTH_INITIAL_STATE,
  reducers: {
    setUserId: (state, { payload }) => {
      state.userId = payload;
    },
    setRequiredAppVersion: (state, { payload }) => {
      state.appVersion = payload;
    },
    setAccessToken: (state, { payload }) => {
      state.accessToken = payload;
    },
    setRefreshToken: (state, { payload }) => {
      state.refreshToken = payload;
    },
    resetAuthSlice: () => AUTH_INITIAL_STATE,
  },
});

export const {
  setUserId,
  setRequiredAppVersion,
  setAccessToken,
  setRefreshToken,
  resetAuthSlice,
} = auth.actions;

export default auth.reducer;
