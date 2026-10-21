import { MEDIA_UPLOAD_REQUEST_TIMEOUT, Methods, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import { deviceId, deviceMetadata, deviceName, platform } from '@U/device/device-id';
import type { BaseQueryApi, FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface UploadedPhotoResponse {
  url?: string;
  key?: string;
  assetId?: string;
  status?: MediaUploadStatus;
  contentType: string;
}

export type MediaUploadStatus = 'queued' | 'processing' | 'review_required' | 'approved' | 'rejected' | 'failed';

export interface MediaUploadStatusResponse {
  items: {
    assetId: string;
    status: MediaUploadStatus;
    url?: string;
    contentType: string;
  }[];
}

type MediaUploadRole = 'media' | 'thumbnail';

export interface MediaUploadManifestEntry {
  mediaId: string;
  role: MediaUploadRole;
}

export interface UploadedPhotoBatchResponse extends UploadedPhotoResponse {
  mediaId: string;
  role: MediaUploadRole;
}

interface PhotoUploadRequest {
  body: FormData;
  onProgress?: (progress: number) => void;
}

interface DeletePhotoRequest {
  url: string;
}

interface DeleteModerationUploadRequest {
  assetId: string;
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

function uploadWithXhr<T>(
  body: FormData,
  api: BaseQueryApi,
  path: string,
  onProgress?: (progress: number) => void,
): Promise<XhrResult<T>> {
  return new Promise((resolve) => {
    const request = new XMLHttpRequest();
    let settled = false;

    const finish = (result: XhrResult<T>) => {
      if (settled) return;
      settled = true;
      api.signal.removeEventListener('abort', abortRequest);
      resolve(result);
    };

    const abortRequest = () => {
      request.abort();
      finish({ error: { status: 'FETCH_ERROR', error: 'Запрос отправки фотографии отменён' } });
    };

    request.open('POST', `${API_BASE_URL.replace(/\/$/, '')}${path}`);
    request.timeout = MEDIA_UPLOAD_REQUEST_TIMEOUT;

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
        finish({ data: data as T });
      } else {
        finish({ error: { status: request.status, data } });
      }
    };
    request.onerror = () => finish({ error: { status: 'FETCH_ERROR', error: 'Не удалось отправить медиафайлы' } });
    request.ontimeout = () =>
      finish({ error: { status: 'TIMEOUT_ERROR', error: 'Истекло время ожидания отправки медиафайлов' } });
    request.onabort = () => finish({ error: { status: 'FETCH_ERROR', error: 'Отправка медиафайлов отменена' } });
    if (request.upload && onProgress) {
      request.upload.onprogress = ({ loaded, total, lengthComputable }) => {
        if (lengthComputable && total > 0) onProgress(Math.min(loaded / total, 1));
      };
    }

    api.signal.addEventListener('abort', abortRequest, { once: true });

    // Do not set Content-Type manually. Native XMLHttpRequest adds the multipart
    // boundary required to transmit React Native's FormData/File payload.
    request.send(body);
  });
}

function uploadPhotoWithXhr({ body, onProgress }: PhotoUploadRequest, api: BaseQueryApi) {
  return uploadWithXhr<UploadedPhotoResponse>(body, api, '/photo', onProgress);
}

function uploadPhotosWithXhr({ body, onProgress }: PhotoUploadRequest, api: BaseQueryApi) {
  return uploadWithXhr<UploadedPhotoBatchResponse[]>(body, api, '/photo/batch', onProgress);
}

export const photosApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: ({ mutation, query }) => ({
    uploadPhoto: mutation<UploadedPhotoResponse, PhotoUploadRequest>({
      queryFn: (body, api) => uploadPhotoWithXhr(body, api),
      invalidatesTags: [Tags.profile, Tags.activities],
    }),
    uploadPhotos: mutation<UploadedPhotoBatchResponse[], PhotoUploadRequest>({
      queryFn: (body, api) => uploadPhotosWithXhr(body, api),
      invalidatesTags: [Tags.profile, Tags.activities],
    }),
    deletePhoto: mutation<void, DeletePhotoRequest>({
      query: (body) => ({ url: '/photo', method: Methods.delete, body }),
      invalidatesTags: [Tags.profile, Tags.activities],
    }),
    deleteModerationUpload: mutation<void, DeleteModerationUploadRequest>({
      query: ({ assetId }) => ({ url: `/photo/${assetId}`, method: Methods.delete }),
    }),
    getMediaUploadStatuses: query<MediaUploadStatusResponse, { ids: string[] }>({
      query: ({ ids }) => ({ url: '/photo/status', params: { ids: ids.join(',') } }),
    }),
    publishApprovedMediaUpload: mutation<{ url: string; key: string }, { assetId: string }>({
      query: ({ assetId }) => ({ url: `/photo/${assetId}/publish`, method: Methods.post }),
    }),
  }),
});

export const { useGetMediaUploadStatusesQuery } = photosApi;
