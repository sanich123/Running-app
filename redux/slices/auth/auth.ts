import { createSlice } from '@reduxjs/toolkit';

export const auth = createSlice({
  name: 'auth',
  initialState: { accessToken: '', userId: '', appVersion: '' },
  reducers: {
    setAccessToken: (state, { payload }) => {
      state.accessToken = payload;
    },
    setUserId: (state, { payload }) => {
      state.userId = payload;
    },
    setRequiredAppVersion: (state, { payload }) => {
      state.appVersion = payload;
    },
  },
});

export const { setAccessToken, setUserId, setRequiredAppVersion } = auth.actions;

export default auth.reducer;
