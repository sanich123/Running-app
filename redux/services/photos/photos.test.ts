import { MEDIA_UPLOAD_REQUEST_TIMEOUT } from '@R/runich-api/const';
import { resetAuthSlice, setAuthTokens } from '@R/slices/auth/auth';
import { mockStore } from '@T/utils/mock-store';
import { photosApi } from './photos';

interface ProgressEventLike {
  loaded: number;
  total: number;
  lengthComputable: boolean;
}

class MockXMLHttpRequest {
  static lastRequest: MockXMLHttpRequest | undefined;
  upload: { onprogress: ((event: ProgressEventLike) => void) | null } = { onprogress: null };
  status = 200;
  responseText = '{"url":"https://cdn.example/photo.jpg","key":"photo.jpg","contentType":"image/jpeg"}';
  timeout = 0;
  open = jest.fn();
  setRequestHeader = jest.fn();
  send = jest.fn();
  abort = jest.fn(() => this.onabort?.());
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  onabort: (() => void) | null = null;

  constructor() {
    MockXMLHttpRequest.lastRequest = this;
  }
}

describe('photo upload XHR transport', () => {
  const originalXMLHttpRequest = globalThis.XMLHttpRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    MockXMLHttpRequest.lastRequest = undefined;
    Object.defineProperty(globalThis, 'XMLHttpRequest', {
      configurable: true,
      value: MockXMLHttpRequest as unknown as typeof XMLHttpRequest,
    });
    mockStore.dispatch(setAuthTokens({ accessToken: 'test-access-token' }));
  });

  afterEach(() => mockStore.dispatch(resetAuthSlice()));

  afterAll(() => {
    Object.defineProperty(globalThis, 'XMLHttpRequest', { configurable: true, value: originalXMLHttpRequest });
  });

  it('sends a single upload with auth and device headers and reports bounded progress', async () => {
    const onProgress = jest.fn();
    const pendingUpload = mockStore.dispatch(
      photosApi.endpoints.uploadPhoto.initiate({ body: new FormData(), onProgress }),
    );
    const request = MockXMLHttpRequest.lastRequest;
    expect(request).toBeDefined();
    expect(request?.open).toHaveBeenCalledWith('POST', expect.stringMatching(/\/photo$/));
    expect(request?.timeout).toBe(MEDIA_UPLOAD_REQUEST_TIMEOUT);
    expect(request?.setRequestHeader).toHaveBeenCalledWith('x-device-id', expect.any(String));
    expect(request?.setRequestHeader).toHaveBeenCalledWith('authorization', 'Bearer test-access-token');

    request?.upload.onprogress?.({ loaded: 3, total: 0, lengthComputable: true });
    request?.upload.onprogress?.({ loaded: 10, total: 10, lengthComputable: false });
    request?.upload.onprogress?.({ loaded: 12, total: 10, lengthComputable: true });
    expect(onProgress).toHaveBeenCalledTimes(1);
    expect(onProgress).toHaveBeenCalledWith(1);

    request!.onload?.();
    await expect(pendingUpload.unwrap()).resolves.toEqual({
      url: 'https://cdn.example/photo.jpg',
      key: 'photo.jpg',
      contentType: 'image/jpeg',
    });
    expect(request?.send).toHaveBeenCalledTimes(1);
  });

  it('omits authorization when the user is signed out', async () => {
    mockStore.dispatch(resetAuthSlice());
    const pendingUpload = mockStore.dispatch(photosApi.endpoints.uploadPhoto.initiate({ body: new FormData() }));
    const request = MockXMLHttpRequest.lastRequest!;

    expect(request.setRequestHeader).not.toHaveBeenCalledWith('authorization', expect.any(String));
    request.onload?.();
    await expect(pendingUpload.unwrap()).resolves.toMatchObject({ url: 'https://cdn.example/photo.jpg' });
  });

  it('returns parsed server errors and preserves non-JSON response text', async () => {
    const serverErrorUpload = mockStore.dispatch(photosApi.endpoints.uploadPhoto.initiate({ body: new FormData() }));
    const serverErrorRequest = MockXMLHttpRequest.lastRequest!;
    serverErrorRequest.status = 413;
    serverErrorRequest.responseText = '{"message":"too large"}';
    serverErrorRequest.onload?.();
    await expect(serverErrorUpload.unwrap()).rejects.toMatchObject({ status: 413, data: { message: 'too large' } });

    const textErrorUpload = mockStore.dispatch(photosApi.endpoints.uploadPhotos.initiate({ body: new FormData() }));
    const textErrorRequest = MockXMLHttpRequest.lastRequest!;
    textErrorRequest.status = 500;
    textErrorRequest.responseText = 'upstream failure';
    textErrorRequest.onload?.();
    await expect(textErrorUpload.unwrap()).rejects.toMatchObject({ status: 500, data: 'upstream failure' });
  });

  it.each([
    ['network error', (request: MockXMLHttpRequest) => request.onerror?.(), 'FETCH_ERROR'],
    ['timeout', (request: MockXMLHttpRequest) => request.ontimeout?.(), 'TIMEOUT_ERROR'],
    ['explicit abort event', (request: MockXMLHttpRequest) => request.onabort?.(), 'FETCH_ERROR'],
  ])('reports an XHR %s', async (_caseName, triggerEvent, expectedStatus) => {
    const pendingUpload = mockStore.dispatch(photosApi.endpoints.uploadPhotos.initiate({ body: new FormData() }));
    triggerEvent(MockXMLHttpRequest.lastRequest!);

    await expect(pendingUpload.unwrap()).rejects.toMatchObject({ status: expectedStatus });
  });

  it('aborts the request when RTK Query cancels the upload', async () => {
    const pendingUpload = mockStore.dispatch(photosApi.endpoints.uploadPhoto.initiate({ body: new FormData() }));
    const request = MockXMLHttpRequest.lastRequest!;
    pendingUpload.abort();

    await expect(pendingUpload.unwrap()).rejects.toMatchObject({ name: 'AbortError' });
    expect(request.abort).toHaveBeenCalledTimes(1);
  });
});
