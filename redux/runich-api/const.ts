import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { router } from 'expo-router';
import { ROUTES } from '@const/enums';
import { resetAuthSlice, setAuthTokens } from '@R/slices/auth/auth';
import { flushAuthPersistence } from '@R/slices/auth/persistence';
import { deviceId, deviceName, deviceMetadata, platform } from '@U/device/device-id';
import type { ApiState, AuthResponse } from './types';
import type { BaseQueryApi, FetchArgs } from '@reduxjs/toolkit/query/react';

export { ACTIVITY_MIGRATION_STATUS } from './migration-status';

export const headers = { 'Content-type': 'application/json' };

export enum Tags {
  activities = 'activities',
  statistics = 'statistics',
  profile = 'profile',
  comments = 'comments',
  commentLikes = 'commentLikes',
  likes = 'likes',
  friends = 'friends',
  users = 'users',
}

export enum Methods {
  post = 'POST',
  delete = 'DELETE',
  patch = 'PATCH',
}

export enum Routes {
  user = 'user',
  profile = 'profile',
  activity = 'activity',
  friend = 'friend',
  comment = 'comment',
  commentLike = 'commentLike',
  like = 'like',
  auth = 'auth',
  activityId = 'activityId',
  all = 'all',
  photos = 'photos',
  followers = 'followers',
  statistics = 'statistics',
  email = 'email',
}

export const API_NAME = 'runnichApi';
export const LIMIT_OF_REQUEST = 25000;

export const PUBLIC_AUTH_ENDPOINTS = new Set([
  'registerUser',
  'loginUser',
  'requestEmailLink',
  'refreshToken',
  'verifyConfig',
  'confirmSignUpCodeByEmail',
  'getEmailCodeForPassword',
  'verifyPasswordChangeCode',
  'changePassword',
]);

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_BASE_URL ?? 'http://localhost:3000',
  timeout: LIMIT_OF_REQUEST,
  prepareHeaders: (headers, { endpoint, getState }) => {
    const accessToken = (getState() as ApiState).auth.accessToken;
    if (accessToken && !PUBLIC_AUTH_ENDPOINTS.has(endpoint)) {
      headers.set('authorization', `Bearer ${accessToken}`);
    }
    headers.set('x-device-id', deviceId);
    headers.set('x-device-name', deviceName);
    headers.set('x-platform', platform);
    const deviceHeaders = {
      'x-device-model': deviceMetadata.model,
      'x-device-manufacturer': deviceMetadata.manufacturer,
      'x-device-os-name': deviceMetadata.osName,
      'x-device-os-version': deviceMetadata.osVersion,
      'x-device-type': deviceMetadata.deviceType,
      'x-app-version': deviceMetadata.appVersion,
      'x-app-build': deviceMetadata.appBuild,
    };
    Object.entries(deviceHeaders).forEach(([name, value]) => {
      if (value) headers.set(name, value);
    });
    return headers;
  },
});

const mutex = new Mutex();

async function showErrorToast(message: string, error?: unknown) {
  try {
    const { errorToast } = await import('@S/error-toast/error-toast');
    errorToast(message, error);
  } catch {
    // Error reporting must not turn the original API error into an unhandled exception.
  }
}

async function handleAuthFailure(api: BaseQueryApi) {
  api.dispatch(resetAuthSlice());
  await flushAuthPersistence();
  router.replace(`/${ROUTES.signIn}`);
  await showErrorToast('Не удалось обновить авторизационные данные. Пожалуйста, авторизуйтесь повторно');
}

export async function baseQueryWithReauth(args: string | FetchArgs, api: BaseQueryApi, extraOptions: object) {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);
  const { refreshToken } = (api.getState() as ApiState).auth;

  if (result.error?.status === 401 && !PUBLIC_AUTH_ENDPOINTS.has(api.endpoint)) {
    if (!refreshToken) {
      await handleAuthFailure(api);
      return result;
    }

    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await baseQuery(
          {
            url: 'auth/refresh',
            method: 'POST',
            body: { refreshToken },
          },
          api,
          extraOptions,
        );
        const refreshData = refreshResult.data as AuthResponse | undefined;
        const newAccessToken = refreshData?.accessToken;

        if (newAccessToken) {
          api.dispatch(setAuthTokens({ accessToken: newAccessToken, refreshToken: refreshData?.refreshToken }));
          await flushAuthPersistence();
          result = await baseQuery(args, api, extraOptions);
        } else if (refreshResult.error?.status === 401) {
          await handleAuthFailure(api);
        } else {
          result = refreshResult;
        }
      } catch (error) {
        await showErrorToast('', error);
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  const isGatewayFailure =
    result.error?.status === 502 ||
    result.error?.status === 503 ||
    (result.error?.status === 'PARSING_ERROR' &&
      (result.error.originalStatus === 502 || result.error.originalStatus === 503));

  if (isGatewayFailure) {
    try {
      router.replace(`/${ROUTES.maintenance}`);
    } catch {
      // The imperative router can be unavailable before the first render. Keep the API error intact.
    }
  }

  return result;
}
