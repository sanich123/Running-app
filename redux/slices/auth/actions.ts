import { createAction } from '@reduxjs/toolkit';

export const setAccessToken = createAction<string>('auth/setAccessToken');
export const setRefreshToken = createAction<string>('auth/setRefreshToken');
export const resetAuthSlice = createAction('auth/resetAuthSlice');
