import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { router } from 'expo-router';
import { ROUTES } from '@const/enums';
import { resetAuthSlice, setAccessToken, setRefreshToken } from '@R/slices/auth/auth';
import { deviceId, deviceName, deviceMetadata, platform } from '@U/device/device-id';
import { API_NAME, LIMIT_OF_REQUEST, Tags } from './const';
import type { AuthResponse } from './types';
import type { BaseQueryApi, FetchArgs } from '@reduxjs/toolkit/query/react';

interface ApiState {
  auth: {
    accessToken?: string;
    refreshToken?: string;
  };
}

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_BASE_URL,
  timeout: LIMIT_OF_REQUEST,
  prepareHeaders: (headers, { endpoint, getState }) => {
    const accessToken = (getState() as ApiState).auth.accessToken;
    if (accessToken && !['registerUser', 'loginUser', 'refreshToken'].includes(endpoint)) {
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
  router.replace(`/${ROUTES.signIn}`);
  await showErrorToast('Не удалось обновить авторизационные данные. Пожалуйста, авторизуйтесь повторно');
}

async function baseQueryWithReauth(args: string | FetchArgs, api: BaseQueryApi, extraOptions: object) {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);
  const { refreshToken } = (api.getState() as ApiState).auth;

  if (result.error?.status === 401) {
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
          api.dispatch(setAccessToken(newAccessToken));
          if (refreshData?.refreshToken) api.dispatch(setRefreshToken(refreshData.refreshToken));
          result = await baseQuery(args, api, extraOptions);
        } else {
          await handleAuthFailure(api);
        }
      } catch (error) {
        await handleAuthFailure(api);
        await showErrorToast('', error);
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  if (
    result.error?.status === 'PARSING_ERROR' &&
    (result.error.originalStatus === 502 || result.error.originalStatus === 503)
  ) {
    router.replace(`/${ROUTES.maintenance}`);
  }

  return result;
}

export const runichApi = createApi({
  reducerPath: API_NAME,
  tagTypes: [Tags.activities, Tags.profile, Tags.comments, Tags.likes, Tags.friends, Tags.users, Tags.commentLikes],
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});
