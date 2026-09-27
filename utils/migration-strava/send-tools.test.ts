import { errorToast } from '@S/error-toast/error-toast';
import { sendArchiveToServerWeb, MigrationArchiveCancelledError } from './send-tools';

jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));
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
  upload: {
    onprogress?: (event: ProgressEvent) => void;
  };
  onload?: () => void;
  onerror?: () => void;
  ontimeout?: () => void;
  onabort?: () => void;
}

const job = {
  jobId: 'job-id',
  status: 'uploading',
  uploadBytesReceived: 0,
  uploadBytesTotal: 100,
  queuePosition: null,
  queueAhead: 0,
  queueSize: 0,
  totalActivities: 0,
  processedActivities: 0,
  importedActivities: 0,
  skippedActivities: 0,
  errorMessage: null,
  createdAt: new Date().toISOString(),
  startedAt: null,
  finishedAt: null,
} as const;

describe('Strava archive upload transport', () => {
  const originalXhr = globalThis.XMLHttpRequest;
  const originalFetch = globalThis.fetch;
  let xhr: MockXhr;
  let fetchMock: jest.Mock;

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
    xhr.abort.mockImplementation(() => xhr.onabort?.());
    Object.defineProperty(globalThis, 'XMLHttpRequest', {
      configurable: true,
      writable: true,
      value: jest.fn(() => xhr),
    });
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(job),
    });
    Object.defineProperty(globalThis, 'fetch', { configurable: true, writable: true, value: fetchMock });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'XMLHttpRequest', {
      configurable: true,
      writable: true,
      value: originalXhr,
    });
    Object.defineProperty(globalThis, 'fetch', { configurable: true, writable: true, value: originalFetch });
  });

  it('creates a server job, reports byte progress, and accepts the queued response', async () => {
    const setUploadProgress = jest.fn();
    const setIsWaitingForServer = jest.fn();
    const setIsError = jest.fn();
    const onCancelReady = jest.fn();
    const onArchiveUploadAccepted = jest.fn();
    const promise = sendArchiveToServerWeb({
      archiveFile: new Blob(['archive']),
      setIsSendingArchive: jest.fn(),
      setIsWaitingForServer,
      setUploadProgress,
      onCancelReady,
      onArchiveUploadAccepted,
      setIsError,
      userId: 'user-id',
      accessToken: 'access-token',
    });
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/activity/migration-strava/user-id/start'),
      expect.objectContaining({ method: 'POST' }),
    );
    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 42, total: 100 } as ProgressEvent);
    expect(setUploadProgress).toHaveBeenLastCalledWith(0.42);

    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 100, total: 100 } as ProgressEvent);
    expect(setIsWaitingForServer).toHaveBeenCalledWith(true);
    xhr.status = 202;
    xhr.responseText = JSON.stringify({ ...job, status: 'queued', uploadBytesReceived: 100 });
    xhr.onload?.();

    await expect(promise).resolves.toMatchObject({ jobId: 'job-id', status: 'queued' });
    expect(onArchiveUploadAccepted).toHaveBeenCalledTimes(2);
    expect(setIsError).not.toHaveBeenCalled();
  });

  it('cancels the native request and sends server cancellation', async () => {
    const setIsError = jest.fn();
    const onCancelReady = jest.fn();
    const promise = sendArchiveToServerWeb({
      archiveFile: new Blob(['archive']),
      setIsSendingArchive: jest.fn(),
      setIsWaitingForServer: jest.fn(),
      setUploadProgress: jest.fn(),
      onCancelReady,
      onArchiveUploadAccepted: jest.fn(),
      setIsError,
      userId: 'user-id',
      accessToken: 'access-token',
    });
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    const cancel = onCancelReady.mock.calls.find(([handler]) => typeof handler === 'function')?.[0] as
      (() => void) | undefined;

    cancel?.();

    await expect(promise).rejects.toBeInstanceOf(MigrationArchiveCancelledError);
    expect(xhr.abort).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/activity/migration-strava/jobs/job-id/cancel'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(setIsError).not.toHaveBeenCalled();
  });

  it('keeps the server job active when the transport times out after sending the whole archive', async () => {
    const setIsError = jest.fn();
    const onArchiveUploadAccepted = jest.fn();
    const setIsWaitingForServer = jest.fn();
    const promise = sendArchiveToServerWeb({
      archiveFile: new Blob(['archive']),
      setIsSendingArchive: jest.fn(),
      setIsWaitingForServer,
      setUploadProgress: jest.fn(),
      onCancelReady: jest.fn(),
      onArchiveUploadAccepted,
      setIsError,
      userId: 'user-id',
      accessToken: 'access-token',
    });
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 100, total: 100 } as ProgressEvent);
    xhr.ontimeout?.();

    await expect(promise).resolves.toMatchObject({ jobId: 'job-id', status: 'uploading' });
    expect(onArchiveUploadAccepted).toHaveBeenCalledTimes(1);
    expect(setIsError).not.toHaveBeenCalled();
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('reports an explicit transfer error when the server rejects the archive', async () => {
    const setIsError = jest.fn();
    const promise = sendArchiveToServerWeb({
      archiveFile: new Blob(['archive']),
      setIsSendingArchive: jest.fn(),
      setIsWaitingForServer: jest.fn(),
      setUploadProgress: jest.fn(),
      onCancelReady: jest.fn(),
      onArchiveUploadAccepted: jest.fn(),
      setIsError,
      userId: 'user-id',
      accessToken: 'access-token',
    });
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 100, total: 100 } as ProgressEvent);
    xhr.status = 413;
    xhr.responseText = JSON.stringify({ message: 'Размер архива превышает допустимый лимит' });
    xhr.onload?.();

    await expect(promise).rejects.toThrow('Ошибка передачи архива: Размер архива превышает допустимый лимит');
    expect(setIsError).toHaveBeenCalledWith('Ошибка передачи архива: Размер архива превышает допустимый лимит');
    expect(errorToast).toHaveBeenCalledWith('Ошибка передачи архива', expect.any(Error));
  });
});
