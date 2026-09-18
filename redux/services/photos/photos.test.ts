import { configureStore } from '@reduxjs/toolkit';
import { runichApi } from '@R/runich-api/runich-api';
import authReducer, { setAuthTokens } from '@R/slices/auth/auth';
import { photosApi } from './photos';

interface MockXhr {
  open: jest.Mock;
  setRequestHeader: jest.Mock;
  send: jest.Mock;
  abort: jest.Mock;
  status: number;
  responseText: string;
  onload?: () => void;
  onerror?: () => void;
  ontimeout?: () => void;
  onabort?: () => void;
  upload: { onprogress?: (event: ProgressEvent) => void };
}

describe('photos API upload transport', () => {
  const originalXhr = globalThis.XMLHttpRequest;
  let xhr: MockXhr;

  beforeEach(() => {
    xhr = {
      open: jest.fn(),
      setRequestHeader: jest.fn(),
      send: jest.fn(),
      abort: jest.fn(),
      status: 0,
      responseText: '',
      upload: {},
    };
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

  it('sends FormData through native XMLHttpRequest with auth and device headers', async () => {
    xhr.send.mockImplementation((body: FormData) => {
      expect(body).toBeInstanceOf(FormData);
      void Promise.resolve().then(() => {
        xhr.status = 201;
        xhr.responseText = JSON.stringify({
          url: 'https://cdn.example/photo.jpg',
          key: 'user/photo.jpg',
          contentType: 'image/jpeg',
        });
        xhr.onload?.();
      });
    });

    const formData = new FormData();
    formData.append('file', 'native-file-descriptor');
    const store = createStore();
    store.dispatch(setAuthTokens({ accessToken: 'access-token' }));

    await expect(
      store.dispatch(photosApi.endpoints.uploadPhoto.initiate({ body: formData })).unwrap(),
    ).resolves.toEqual({
      url: 'https://cdn.example/photo.jpg',
      key: 'user/photo.jpg',
      contentType: 'image/jpeg',
    });

    const baseUrl = process.env.EXPO_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    expect(xhr.open).toHaveBeenCalledWith('POST', `${baseUrl.replace(/\/$/, '')}/photo`);
    expect(xhr.send).toHaveBeenCalledWith(formData);
    expect(xhr.setRequestHeader).toHaveBeenCalledWith('authorization', 'Bearer access-token');
    expect(xhr.setRequestHeader).toHaveBeenCalledWith('x-platform', 'mobile');
    expect(xhr.setRequestHeader.mock.calls.some(([name]) => name.toLowerCase() === 'content-type')).toBe(false);
  });

  it('returns the server error response from the XHR queryFn', async () => {
    xhr.send.mockImplementation(() => {
      void Promise.resolve().then(() => {
        xhr.status = 413;
        xhr.responseText = JSON.stringify({ message: 'Файл слишком большой' });
        xhr.onload?.();
      });
    });

    const result = await createStore().dispatch(photosApi.endpoints.uploadPhoto.initiate({ body: new FormData() }));

    expect(result.error).toEqual({ status: 413, data: { message: 'Файл слишком большой' } });
  });

  it('reports upload progress from XMLHttpRequest', async () => {
    xhr.send.mockImplementation(() => {
      xhr.upload.onprogress?.({ loaded: 50, total: 100, lengthComputable: true } as ProgressEvent);
      void Promise.resolve().then(() => {
        xhr.status = 201;
        xhr.responseText = JSON.stringify({
          url: 'https://cdn.example/photo.jpg',
          key: 'user/photo.jpg',
          contentType: 'image/jpeg',
        });
        xhr.onload?.();
      });
    });
    const onProgress = jest.fn();

    await expect(
      createStore()
        .dispatch(photosApi.endpoints.uploadPhoto.initiate({ body: new FormData(), onProgress }))
        .unwrap(),
    ).resolves.toEqual(expect.objectContaining({ url: 'https://cdn.example/photo.jpg' }));

    expect(onProgress).toHaveBeenCalledWith(0.5);
  });

  it('sends a manifest batch to the batch endpoint', async () => {
    xhr.send.mockImplementation((body: FormData) => {
      expect(body.getAll('files')).toHaveLength(2);
      expect(body.get('manifest')).toBe(
        JSON.stringify([
          { mediaId: 'media-1', role: 'media' },
          { mediaId: 'media-2', role: 'thumbnail' },
        ]),
      );
      void Promise.resolve().then(() => {
        xhr.status = 201;
        xhr.responseText = JSON.stringify([
          {
            url: 'https://cdn.example/photo.jpg',
            key: 'photo.jpg',
            contentType: 'image/jpeg',
            mediaId: 'media-1',
            role: 'media',
          },
          {
            url: 'https://cdn.example/thumbnail.jpg',
            key: 'thumbnail.jpg',
            contentType: 'image/jpeg',
            mediaId: 'media-2',
            role: 'thumbnail',
          },
        ]);
        xhr.onload?.();
      });
    });

    const formData = new FormData();
    formData.append('files', 'native-file-1');
    formData.append('files', 'native-file-2');
    formData.append(
      'manifest',
      JSON.stringify([
        { mediaId: 'media-1', role: 'media' },
        { mediaId: 'media-2', role: 'thumbnail' },
      ]),
    );

    await expect(storeDispatchUploadBatch(formData)).resolves.toEqual([
      {
        url: 'https://cdn.example/photo.jpg',
        key: 'photo.jpg',
        contentType: 'image/jpeg',
        mediaId: 'media-1',
        role: 'media',
      },
      {
        url: 'https://cdn.example/thumbnail.jpg',
        key: 'thumbnail.jpg',
        contentType: 'image/jpeg',
        mediaId: 'media-2',
        role: 'thumbnail',
      },
    ]);

    const baseUrl = process.env.EXPO_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    expect(xhr.open).toHaveBeenCalledWith('POST', `${baseUrl.replace(/\/$/, '')}/photo/batch`);
  });
});

async function storeDispatchUploadBatch(formData: FormData) {
  const store = createStore();
  store.dispatch(setAuthTokens({ accessToken: 'access-token' }));
  return await store.dispatch(photosApi.endpoints.uploadPhotos.initiate({ body: formData })).unwrap();
}

function createStore() {
  return configureStore({
    reducer: { auth: authReducer, [runichApi.reducerPath]: runichApi.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(runichApi.middleware),
  });
}
