import { authenticationApi } from '@R/services/authentication/authentication';
import { createSlice } from '@reduxjs/toolkit';
import { setAccessTokenToStorage } from '@U/async-storage';

export const auth = createSlice({
  name: 'auth',
  initialState: { accessToken: '', userId: '', appVersion: '' },
  reducers: {
    setUserId: (state, { payload }) => {
      state.userId = payload;
    },
    setRequiredAppVersion: (state, { payload }) => {
      state.appVersion = payload;
    },
    resetAuthSlice: (state) => {
      return (state = { accessToken: '', userId: '', appVersion: '' });
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authenticationApi.endpoints.loginUser.matchFulfilled,
      (state, { payload: { id, accessToken } }) => {
        if (accessToken) {
          setAccessTokenToStorage(accessToken);
        }
        state.userId = id;
      },
    );
    builder.addMatcher(
      authenticationApi.endpoints.verifyConfig.matchFulfilled,
      (state, { payload: { id, accessToken, appVersion } }) => {
        if (accessToken) {
          setAccessTokenToStorage(accessToken);
        }
        state.userId = id;
        state.appVersion = appVersion;
      },
    );
  },
});

export const { setUserId, setRequiredAppVersion, resetAuthSlice } = auth.actions;

export default auth.reducer;
