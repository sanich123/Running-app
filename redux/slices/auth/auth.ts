import { createSlice } from '@reduxjs/toolkit';
import { authenticationApi } from '@R/services/authentication/authentication';
import { AUTH_INITIAL_STATE } from './const';

export const auth = createSlice({
  name: 'auth',
  initialState: AUTH_INITIAL_STATE,
  reducers: {
    setUserId: (state, { payload }) => {
      state.userId = payload;
    },
    setRequiredAppVersion: (state, { payload }) => {
      state.appVersion = payload;
    },
    resetAuthSlice: () => {
      return AUTH_INITIAL_STATE;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authenticationApi.endpoints.loginUser.matchFulfilled,
      (state, { payload: { id, accessToken } }) => {
        state.accessToken = accessToken;
        state.userId = id;
        state.isNeedToShowConfirmEmailInput = false;
      },
    );
    builder.addMatcher(
      authenticationApi.endpoints.verifyConfig.matchFulfilled,
      (state, { payload: { id, accessToken, appVersion } }) => {
        state.accessToken = accessToken;
        state.userId = id;
        state.appVersion = appVersion;
        state.isNeedToShowConfirmEmailInput = false;
      },
    );
    builder.addMatcher(authenticationApi.endpoints.registerUser.matchFulfilled, (state) => {
      state.isNeedToShowConfirmEmailInput = true;
    });
    builder.addMatcher(
      authenticationApi.endpoints.confirmSignUpCodeByEmail.matchFulfilled,
      (state, { payload: { id, accessToken } }) => {
        state.accessToken = accessToken;
        state.isNeedToShowConfirmEmailInput = false;
        state.userId = id;
      },
    );
  },
});

export const { setUserId, setRequiredAppVersion, resetAuthSlice } = auth.actions;

export default auth.reducer;
