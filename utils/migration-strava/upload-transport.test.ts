import { backgroundUpload, cancelUpload, UploadType } from 'react-native-compressor';
import { TEST_URLS } from '@T/mocks/const';
import { nativeArchiveUploadTransport, webArchiveUploadTransport } from './upload-transport';
import { MigrationArchiveCancelledError } from './utils';
import type { ArchiveUploadRequest } from './upload-transport';

jest.mock('react-native-compressor', () => ({
  UploadType: { BINARY_CONTENT: 0 },
  backgroundUpload: jest.fn(),
  cancelUpload: jest.fn(),
}));

interface MockXhr {
  open: jest.Mock;
  setRequestHeader: jest.Mock;
  send: jest.Mock;
  abort: jest.Mock;
  status: number;
  responseText: string;
  timeout: number;
  upload: { onprogress?: (event: ProgressEvent) => void };
  onload?: () => void;
  onerror?: () => void;
  ontimeout?: () => void;
  onabort?: () => void;
}

const createRequest = (overrides: Partial<ArchiveUploadRequest> = {}): ArchiveUploadRequest => ({
  url: TEST_URLS.archiveEndpoint,
  accessToken: 'token',
  fileUri: TEST_URLS.archiveFileUri,
  file: new Blob(['archive']),
  onProgress: jest.fn(),
  onCancelReady: jest.fn(),
  ...overrides,
});

describe('archive upload transports', () => {
  const originalXhr = globalThis.XMLHttpRequest;
  let xhr: MockXhr;

  beforeEach(() => {
    jest.clearAllMocks();
    xhr = {
      open: jest.fn(),
      setRequestHeader: jest.fn(),
      send: jest.fn(),
      abort: jest.fn(),
      status: 0,
      responseText: '',
      timeout: 0,
      upload: {},
    };
    Object.defineProperty(globalThis, 'XMLHttpRequest', {
      configurable: true,
      writable: true,
      value: jest.fn(() => xhr),
    });
  });

  afterAll(() => {
    Object.defineProperty(globalThis, 'XMLHttpRequest', {
      configurable: true,
      writable: true,
      value: originalXhr,
    });
  });

  it('validates native file paths and normalizes incomplete native responses', async () => {
    await expect(nativeArchiveUploadTransport.upload(createRequest({ fileUri: undefined }))).rejects.toThrow(
      'Не указан локальный путь к архиву',
    );

    let cancel: (() => void) | undefined;
    (backgroundUpload as jest.Mock).mockImplementation(async (_url, _fileUri, options) => {
      options.getCancellationId('upload-id');
      return { status: undefined, body: { error: true } };
    });
    const result = await nativeArchiveUploadTransport.upload(
      createRequest({ onCancelReady: (nextCancel) => (cancel = nextCancel) }),
    );

    expect(UploadType.BINARY_CONTENT).toBe(0);
    expect(result).toEqual({ status: 0, body: '' });
    expect(backgroundUpload).toHaveBeenCalledWith(
      TEST_URLS.archiveEndpoint,
      TEST_URLS.archiveFileUri,
      expect.objectContaining({ headers: { authorization: 'Bearer token' } }),
      expect.any(Function),
    );
    cancel?.();
    expect(cancelUpload).toHaveBeenCalledWith('upload-id');
  });

  it('reports only computable web progress and ignores duplicate completion events', async () => {
    const onProgress = jest.fn();
    const pending = webArchiveUploadTransport.upload(createRequest({ onProgress }));
    expect(xhr.open).toHaveBeenCalledWith('POST', TEST_URLS.archiveEndpoint);
    expect(xhr.setRequestHeader).toHaveBeenCalledWith('authorization', 'Bearer token');
    expect(xhr.setRequestHeader).toHaveBeenCalledWith('content-type', 'application/zip');
    expect(xhr.send).toHaveBeenCalled();

    xhr.upload.onprogress?.({ lengthComputable: false, loaded: 20, total: 100 } as ProgressEvent);
    expect(onProgress).not.toHaveBeenCalled();
    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 20, total: 100 } as ProgressEvent);
    expect(onProgress).toHaveBeenCalledWith(20, 100);
    xhr.status = 201;
    xhr.responseText = 'accepted';
    xhr.onload?.();
    xhr.onerror?.();

    await expect(pending).resolves.toEqual({ status: 201, body: 'accepted' });
  });

  it.each([
    ['network failure', 'onerror', 'Не удалось отправить архив на сервер'],
    ['timeout', 'ontimeout', 'Истекло время ожидания загрузки архива'],
  ])('rejects a web upload on %s', async (_description, eventName, message) => {
    const pending = webArchiveUploadTransport.upload(createRequest());
    xhr[eventName as 'onerror' | 'ontimeout']?.();
    await expect(pending).rejects.toThrow(message);
  });

  it('rejects web uploads without a file and reports browser cancellation', async () => {
    await expect(webArchiveUploadTransport.upload(createRequest({ file: undefined }))).rejects.toThrow(
      'Архив недоступен в браузере',
    );
    const pending = webArchiveUploadTransport.upload(createRequest());
    xhr.onabort?.();
    await expect(pending).rejects.toBeInstanceOf(MigrationArchiveCancelledError);
  });
});
