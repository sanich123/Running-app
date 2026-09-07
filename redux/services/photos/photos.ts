import { LIMIT_OF_REQUEST, Methods, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import { deviceId, deviceMetadata, deviceName, platform } from '@U/device/device-id';
import type { BaseQueryApi, FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface UploadedPhotoResponse {
  url: string;
  key: string;
  contentType: string;
}

export interface DeletePhotoRequest {
  url: string;
}

interface AuthState {
  auth: {
    accessToken?: string;
  };
}

type XhrResult<T> = { data: T } | { error: FetchBaseQueryError };

const API_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL ?? 'http://localhost:3000';

function parseResponseBody(responseText: string) {
  if (!responseText) return undefined;
  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    return responseText;
  }
}

function uploadPhotoWithXhr(body: FormData, api: BaseQueryApi): Promise<XhrResult<UploadedPhotoResponse>> {
  return new Promise((resolve) => {
    const request = new XMLHttpRequest();
    let settled = false;

    const finish = (result: XhrResult<UploadedPhotoResponse>) => {
      if (settled) return;
      settled = true;
      api.signal.removeEventListener('abort', abortRequest);
      resolve(result);
    };

    const abortRequest = () => {
      request.abort();
      finish({ error: { status: 'FETCH_ERROR', error: 'Запрос отправки фотографии отменён' } });
    };

    request.open('POST', `${API_BASE_URL.replace(/\/$/, '')}/photo`);
    request.timeout = LIMIT_OF_REQUEST;

    const { accessToken } = (api.getState() as AuthState).auth;
    if (accessToken) request.setRequestHeader('authorization', `Bearer ${accessToken}`);
    request.setRequestHeader('x-device-id', deviceId);
    request.setRequestHeader('x-device-name', deviceName);
    request.setRequestHeader('x-platform', platform);

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
      if (value) request.setRequestHeader(name, value);
    });

    request.onload = () => {
      const data = parseResponseBody(request.responseText);
      if (request.status >= 200 && request.status < 300) {
        finish({ data: data as UploadedPhotoResponse });
      } else {
        finish({ error: { status: request.status, data } });
      }
    };
    request.onerror = () => finish({ error: { status: 'FETCH_ERROR', error: 'Не удалось отправить фотографию' } });
    request.ontimeout = () =>
      finish({ error: { status: 'TIMEOUT_ERROR', error: 'Истекло время ожидания отправки фотографии' } });
    request.onabort = () => finish({ error: { status: 'FETCH_ERROR', error: 'Отправка фотографии отменена' } });

    api.signal.addEventListener('abort', abortRequest, { once: true });

    // Do not set Content-Type manually. Native XMLHttpRequest adds the multipart
    // boundary required to transmit React Native's FormData/File payload.
    request.send(body);
  });
}

export const photosApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: ({ mutation }) => ({
    uploadPhoto: mutation<UploadedPhotoResponse, FormData>({
      queryFn: (body, api) => uploadPhotoWithXhr(body, api),
      invalidatesTags: [Tags.profile, Tags.activities],
    }),
    deletePhoto: mutation<void, DeletePhotoRequest>({
      query: (body) => ({ url: '/photo', method: Methods.delete, body }),
      invalidatesTags: [Tags.profile, Tags.activities],
    }),
  }),
});
