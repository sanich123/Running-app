import { createSlice } from '@reduxjs/toolkit';
import { AUTH_INITIAL_STATE } from './const';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthSession {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

const auth = createSlice({
  name: 'auth',
  initialState: AUTH_INITIAL_STATE,
  reducers: {
    setAuthTokens: (state, { payload }: PayloadAction<AuthTokens>) => {
      state.accessToken = payload.accessToken;
      if (payload.refreshToken) state.refreshToken = payload.refreshToken;
    },
    setAuthSession: (state, { payload }: PayloadAction<AuthSession>) => {
      state.userId = payload.userId;
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
    },
    resetAuthSlice: () => AUTH_INITIAL_STATE,
  },
});

export const { setAuthTokens, setAuthSession, resetAuthSlice } = auth.actions;

export default auth.reducer;
