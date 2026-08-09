import { createSlice } from '@reduxjs/toolkit';
import { authenticationApi } from '@R/services/authentication/authentication';
import { resetAuthSlice, setAccessToken, setRefreshToken } from './actions';
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
  },
  extraReducers: (builder) => {
    builder.addCase(setAccessToken, (state, { payload }) => {
      state.accessToken = payload;
    });
    builder.addCase(setRefreshToken, (state, { payload }) => {
      state.refreshToken = payload;
    });
    builder.addCase(resetAuthSlice, () => AUTH_INITIAL_STATE);
    builder.addMatcher(
      authenticationApi.endpoints.loginUser.matchFulfilled,
      (state, { payload: { id, accessToken, access, refreshToken, refresh } }) => {
        state.accessToken = accessToken ?? access ?? '';
        state.refreshToken = refreshToken ?? refresh ?? '';
        state.userId = id;
        state.isNeedToShowConfirmEmailInput = false;
      },
    );

    builder.addMatcher(authenticationApi.endpoints.registerUser.matchFulfilled, (state) => {
      state.isNeedToShowConfirmEmailInput = true;
    });
    builder.addMatcher(
      authenticationApi.endpoints.confirmSignUpCodeByEmail.matchFulfilled,
      (state, { payload: { id, accessToken } }) => {
        state.accessToken = accessToken ?? '';
        state.isNeedToShowConfirmEmailInput = false;
        state.userId = id;
      },
    );
  },
});

export const { setUserId, setRequiredAppVersion } = auth.actions;
export { resetAuthSlice, setAccessToken, setRefreshToken } from './actions';

export default auth.reducer;
