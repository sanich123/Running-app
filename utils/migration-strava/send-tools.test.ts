import { errorToast } from '@S/error-toast/error-toast';
import { sendArchiveToServerWeb, MigrationArchiveCancelledError } from './send-tools';

jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));

interface MockXhr {
  open: jest.Mock;
  setRequestHeader: jest.Mock;
  send: jest.Mock;
  abort: jest.Mock;
  status: number;
  responseText: string;
  upload: {
    onprogress?: (event: ProgressEvent) => void;
    onload?: () => void;
  };
  onload?: () => void;
  onerror?: () => void;
  ontimeout?: () => void;
  onabort?: () => void;
}

describe('Strava archive upload transport', () => {
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
      upload: {},
    };
    xhr.abort.mockImplementation(() => xhr.onabort?.());
    Object.defineProperty(globalThis, 'XMLHttpRequest', {
      configurable: true,
      writable: true,
      value: jest.fn(() => xhr),
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'XMLHttpRequest', {
      configurable: true,
      writable: true,
      value: originalXhr,
    });
  });

  it('reports byte progress and marks the request as waiting after the upload', async () => {
    const setUploadProgress = jest.fn();
    const setIsWaitingForServer = jest.fn();
    const setIsError = jest.fn();
    const onCancelReady = jest.fn();
    const promise = sendArchiveToServerWeb({
      archiveFile: new Blob(['archive']),
      setIsSendingArchive: jest.fn(),
      setIsWaitingForServer,
      setUploadProgress,
      onCancelReady,
      setIsError,
      userId: 'user-id',
      accessToken: 'access-token',
    });

    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 42, total: 100 } as ProgressEvent);
    expect(setUploadProgress).toHaveBeenLastCalledWith(0.42);

    xhr.upload.onload?.();
    expect(setUploadProgress).toHaveBeenLastCalledWith(1);
    expect(setIsWaitingForServer).toHaveBeenCalledWith(true);

    xhr.status = 202;
    xhr.responseText = JSON.stringify({ jobId: 'job-id' });
    xhr.onload?.();

    await expect(promise).resolves.toEqual({ jobId: 'job-id' });
    expect(setIsError).not.toHaveBeenCalled();
  });

  it('aborts the XHR and does not report a cancellation as an upload error', async () => {
    const setIsError = jest.fn();
    const onCancelReady = jest.fn();
    const promise = sendArchiveToServerWeb({
      archiveFile: new Blob(['archive']),
      setIsSendingArchive: jest.fn(),
      setIsWaitingForServer: jest.fn(),
      setUploadProgress: jest.fn(),
      onCancelReady,
      setIsError,
      userId: 'user-id',
      accessToken: 'access-token',
    });
    const cancel = onCancelReady.mock.calls.find(([handler]) => typeof handler === 'function')?.[0] as
      (() => void) | undefined;

    cancel?.();

    await expect(promise).rejects.toBeInstanceOf(MigrationArchiveCancelledError);
    expect(xhr.abort).toHaveBeenCalledTimes(1);
    expect(setIsError).not.toHaveBeenCalled();
  });

  it('reports an explicit transfer error when the server rejects the archive', async () => {
    const setIsError = jest.fn();
    const promise = sendArchiveToServerWeb({
      archiveFile: new Blob(['archive']),
      setIsSendingArchive: jest.fn(),
      setIsWaitingForServer: jest.fn(),
      setUploadProgress: jest.fn(),
      onCancelReady: jest.fn(),
      setIsError,
      userId: 'user-id',
      accessToken: 'access-token',
    });

    xhr.status = 413;
    xhr.onload?.();

    await expect(promise).rejects.toThrow('Сервер вернул статус 413');
    expect(setIsError).toHaveBeenCalledWith('Ошибка передачи архива: Сервер вернул статус 413');
    expect(errorToast).toHaveBeenCalledWith('Ошибка передачи архива', expect.any(Error));
  });
});
