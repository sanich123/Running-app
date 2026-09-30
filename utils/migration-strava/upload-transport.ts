import { backgroundUpload, cancelUpload, UploadType } from 'react-native-compressor';
import { MigrationArchiveCancelledError } from './utils';

interface ArchiveUploadResponse {
  status: number;
  body: string;
}

export interface ArchiveUploadRequest {
  url: string;
  accessToken: string;
  fileUri?: string;
  file?: Blob;
  onProgress: (written: number, total: number) => void;
  onCancelReady: (cancel: () => void) => void;
}

export interface ArchiveUploadTransport {
  upload(request: ArchiveUploadRequest): Promise<ArchiveUploadResponse>;
}

export const nativeArchiveUploadTransport: ArchiveUploadTransport = {
  async upload({ url, accessToken, fileUri, onProgress, onCancelReady }) {
    if (!fileUri) throw new Error('Не указан локальный путь к архиву');

    const response = await backgroundUpload(
      url,
      fileUri,
      {
        uploadType: UploadType.BINARY_CONTENT,
        mimeType: 'application/zip',
        httpMethod: 'POST',
        headers: { authorization: `Bearer ${accessToken}` },
        getCancellationId: (cancellationId) => onCancelReady(() => cancelUpload(cancellationId)),
      },
      onProgress,
    );

    return {
      status: Number(response?.status ?? 0),
      body: typeof response?.body === 'string' ? response.body : '',
    };
  },
};

export const webArchiveUploadTransport: ArchiveUploadTransport = {
  upload({ url, accessToken, file, onProgress, onCancelReady }) {
    if (!file) return Promise.reject(new Error('Архив недоступен в браузере'));

    return new Promise<ArchiveUploadResponse>((resolve, reject) => {
      const request = new XMLHttpRequest();
      let settled = false;
      const finish = (callback: () => void) => {
        if (settled) return;
        settled = true;
        callback();
      };

      request.open('POST', url);
      request.setRequestHeader('authorization', `Bearer ${accessToken}`);
      request.setRequestHeader('content-type', 'application/zip');
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(event.loaded, event.total);
      };
      request.onload = () =>
        finish(() =>
          resolve({
            status: request.status,
            body: request.responseText,
          }),
        );
      request.onerror = () => finish(() => reject(new Error('Не удалось отправить архив на сервер')));
      request.ontimeout = () => finish(() => reject(new Error('Истекло время ожидания загрузки архива')));
      request.onabort = () => finish(() => reject(new MigrationArchiveCancelledError()));
      request.timeout = 5 * 60 * 1000;
      onCancelReady(() => request.abort());
      request.send(file);
    });
  },
};
