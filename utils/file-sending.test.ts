import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { http, HttpResponse } from 'msw';
import { Image as ImageCompressor, Video as VideoCompressor, getVideoMetaData } from 'react-native-compressor';
import { Platform } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { changeLanguage } from '@R/slices/settings/settings';
import { store } from '@R/store';
import { errorToast } from '@S/error-toast/error-toast';
import { BASE_URL } from '@T/utils/handlers';
import { server } from '@T/utils/server';
import {
  compressMediaFile,
  createVideoThumbnail,
  deleteUploadedMedia,
  getAccessToGallery,
  uploadMediaFile,
  uploadMediaFiles,
  waitForMediaUploadReview,
  type UploadMediaBatchRequest,
  type UploadMediaRequest,
} from './file-sending';
import { MAX_MEDIA_BATCH_SIZE, MAX_MEDIA_FILE_SIZE } from './file-sending/file-utils';

jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('expo-video-thumbnails', () => ({ getThumbnailAsync: jest.fn() }));
jest.mock('react-native-compressor', () => ({
  Image: { compress: jest.fn() },
  Video: { compress: jest.fn() },
  getVideoMetaData: jest.fn(),
}));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));
const originalPlatform = Platform.OS;
const uploadMedia = jest.fn() as jest.MockedFunction<UploadMediaRequest>;
const uploadMediaBatch = jest.fn() as jest.MockedFunction<UploadMediaBatchRequest>;
const mockErrorToast = errorToast as jest.MockedFunction<typeof errorToast>;
const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
const originalCreateObjectURLDescriptor = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
const originalRevokeObjectURLDescriptor = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');

function mockBrowserVideoMetadata(duration = 20) {
  const video = {
    duration,
    preload: 'none',
    onloadedmetadata: null as (() => void) | null,
    onerror: null as ((event: Event) => void) | null,
    removeAttribute: jest.fn(),
    load: jest.fn(),
  };
  Object.defineProperty(video, 'src', { set: () => video.onloadedmetadata?.() });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: { createElement: jest.fn(() => video) },
  });
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: jest.fn(() => 'blob:video') });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: jest.fn() });
}

function restoreGlobalProperty(target: object, key: string, descriptor?: PropertyDescriptor) {
  if (descriptor) Object.defineProperty(target, key, descriptor);
  else Reflect.deleteProperty(target, key);
}

describe('file sending', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.dispatch(runichApi.util.resetApiState());
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    (ImageCompressor.compress as jest.Mock).mockResolvedValue('compressed-image.jpg');
    (VideoCompressor.compress as jest.Mock).mockResolvedValue('compressed-video.mp4');
    (getVideoMetaData as jest.Mock).mockResolvedValue({ size: 1_000, duration: 10 });
    uploadMedia.mockResolvedValue({
      url: 'https://cdn.example/photo.jpg',
      key: 'user/photo.jpg',
      contentType: 'image/jpeg',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
    restoreGlobalProperty(globalThis, 'document', originalDocumentDescriptor);
    restoreGlobalProperty(URL, 'createObjectURL', originalCreateObjectURLDescriptor);
    restoreGlobalProperty(URL, 'revokeObjectURL', originalRevokeObjectURLDescriptor);
  });

  it('compresses an image without uploading it', async () => {
    await expect(compressMediaFile('photo.JPG?cache=1')).resolves.toEqual({
      file: 'compressed-image.jpg',
      originalName: 'photo.JPG',
      extension: 'jpg',
      isVideo: false,
      mimeType: 'image/jpeg',
    });
    expect(ImageCompressor.compress).toHaveBeenCalledWith('photo.JPG?cache=1');
    expect(uploadMedia).not.toHaveBeenCalled();
  });

  it('keeps browser images without passing them through the native compressor', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });

    await expect(compressMediaFile('photo.jpg')).resolves.toMatchObject({ file: 'photo.jpg', isVideo: false });
    expect(ImageCompressor.compress).not.toHaveBeenCalled();
  });

  it('uploads a compressed file and adds scope metadata', async () => {
    const compressedFile = {
      file: 'compressed-image.jpg',
      originalName: 'feedback.jpg',
      extension: 'jpg',
      isVideo: false,
      mimeType: 'image/jpeg',
    };

    await expect(
      uploadMediaFile(compressedFile, { scope: 'feedback', feedbackId: 'feedback-id' }, uploadMedia),
    ).resolves.toEqual({
      url: 'https://cdn.example/photo.jpg',
      key: 'user/photo.jpg',
      contentType: 'image/jpeg',
    });

    const body = uploadMedia.mock.calls[0]?.[0] as FormData;
    expect(body.get('scope')).toBe('feedback');
    expect(body.get('feedbackId')).toBe('feedback-id');
  });

  it('does not show an offline warning when the upload succeeds', async () => {
    const compressedFile = {
      file: 'compressed-image.jpg',
      originalName: 'photo.jpg',
      extension: 'jpg',
      isVideo: false,
      mimeType: 'image/jpeg',
    };

    await expect(uploadMediaFile(compressedFile, undefined, uploadMedia)).resolves.toEqual(
      expect.objectContaining({ url: 'https://cdn.example/photo.jpg' }),
    );
    expect(uploadMedia).toHaveBeenCalled();
    expect(mockErrorToast).not.toHaveBeenCalled();
  });

  it('uploads a batch with repeated files and a manifest', async () => {
    const compressedFile = {
      file: 'compressed-image.jpg',
      originalName: 'photo.jpg',
      extension: 'jpg',
      isVideo: false,
      mimeType: 'image/jpeg',
    };
    uploadMediaBatch.mockResolvedValue([
      {
        url: 'https://cdn.example/photo.jpg',
        key: 'user/photo.jpg',
        contentType: 'image/jpeg',
        mediaId: 'media-1',
        role: 'media',
      },
    ]);

    await expect(
      uploadMediaFiles(
        [compressedFile],
        { scope: 'activity' },
        [{ mediaId: 'media-1', role: 'media' }],
        uploadMediaBatch,
      ),
    ).resolves.toMatchObject([{ mediaId: 'media-1', role: 'media' }]);

    const body = uploadMediaBatch.mock.calls[0]?.[0] as FormData;
    expect(body.getAll('files')).toHaveLength(1);
    expect(body.get('manifest')).toBe(JSON.stringify([{ mediaId: 'media-1', role: 'media' }]));
    expect(body.get('scope')).toBe('activity');
  });

  it('rejects a browser batch that exceeds 250 MB before sending it', async () => {
    const oversizedFile = {
      name: 'oversized.jpg',
      size: MAX_MEDIA_BATCH_SIZE + 1,
      type: 'image/jpeg',
    } as File;

    await expect(
      uploadMediaFiles(
        [
          {
            file: oversizedFile,
            originalName: oversizedFile.name,
            extension: 'jpg',
            isVideo: false,
            mimeType: oversizedFile.type,
          },
        ],
        { scope: 'activity' },
        [{ mediaId: 'media-1', role: 'media' }],
        uploadMediaBatch,
      ),
    ).resolves.toBeNull();
    expect(uploadMediaBatch).not.toHaveBeenCalled();
    expect(errorToast).toHaveBeenCalledWith(
      'Не удалось загрузить медиафайлы',
      expect.objectContaining({ message: 'Суммарный размер файлов не должен превышать 250 МБ' }),
    );
  });

  it('compresses videos independently from uploading them', async () => {
    await expect(compressMediaFile('activity.MP4')).resolves.toEqual({
      file: 'compressed-video.mp4',
      originalName: 'activity.MP4',
      extension: 'mp4',
      isVideo: true,
      mimeType: 'video/mp4',
    });
    expect(VideoCompressor.compress).toHaveBeenCalledWith('activity.MP4', { maxSize: 720 });

    const thumbnail = await createVideoThumbnail('https://cdn.example/video.mp4');
    expect(thumbnail).toBeNull();
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('skips video thumbnail generation on web without reporting an error', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });

    await expect(createVideoThumbnail('https://cdn.example/video.mp4')).resolves.toBeNull();

    expect(VideoThumbnails.getThumbnailAsync).not.toHaveBeenCalled();
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('creates a video thumbnail as a separate operation', async () => {
    (VideoThumbnails.getThumbnailAsync as jest.Mock).mockResolvedValue({ uri: 'thumbnail.jpg' });

    await expect(createVideoThumbnail('https://cdn.example/video.mp4')).resolves.toBe('thumbnail.jpg');
    expect(VideoThumbnails.getThumbnailAsync).toHaveBeenCalledWith('https://cdn.example/video.mp4');
  });

  it('reports unsupported and oversized files during compression', async () => {
    await expect(compressMediaFile('document.pdf')).resolves.toBeNull();
    expect(errorToast).toHaveBeenCalledWith('Такое разрешение нельзя использовать для изображения');

    await expect(compressMediaFile('archive.mkv')).resolves.toBeNull();
    expect(errorToast).toHaveBeenCalledWith('Поддерживаются только видео MP4, MOV и WebM');

    (getVideoMetaData as jest.Mock)
      .mockResolvedValueOnce({ size: 1_000, duration: 61 })
      .mockResolvedValueOnce({ size: MAX_MEDIA_FILE_SIZE + 1, duration: 10 })
      .mockResolvedValueOnce({ size: MAX_MEDIA_FILE_SIZE + 1, duration: 10 });
    await expect(compressMediaFile('long.mp4')).resolves.toBeNull();
    expect(VideoCompressor.compress).not.toHaveBeenCalled();
    expect(errorToast).toHaveBeenCalledWith('Длительность видео должна быть не более 1 минуты');

    await expect(compressMediaFile('large.mp4')).resolves.toBeNull();
    expect(VideoCompressor.compress).toHaveBeenCalledTimes(1);
    expect(errorToast).toHaveBeenCalledWith('Размер видео должен быть не более 50 МБ');
  });

  it('reports compression and upload errors but treats thumbnail failures as a fallback', async () => {
    const compressionError = new Error('image compression failed');
    (ImageCompressor.compress as jest.Mock).mockRejectedValue(compressionError);
    await expect(compressMediaFile('photo.jpg')).resolves.toBeNull();
    expect(errorToast).toHaveBeenCalledWith('Ошибка во время сжатия изображения', compressionError);

    const uploadError = new Error('upload failed');
    uploadMedia.mockRejectedValue(uploadError);
    await expect(
      uploadMediaFile(
        {
          file: 'compressed.jpg',
          originalName: 'photo.jpg',
          extension: 'jpg',
          isVideo: false,
          mimeType: 'image/jpeg',
        },
        undefined,
        uploadMedia,
      ),
    ).resolves.toBeNull();
    expect(errorToast).toHaveBeenCalledWith('Не удалось загрузить медиафайл', uploadError);

    const thumbnailError = new Error('thumbnail failed');
    (VideoThumbnails.getThumbnailAsync as jest.Mock).mockRejectedValue(thumbnailError);
    await expect(createVideoThumbnail('https://cdn.example/video.mp4')).resolves.toBeNull();
    expect(errorToast).toHaveBeenCalledTimes(2);
  });

  it('uses browser files as-is and reports gallery errors', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const webFile = { name: 'photo.png', size: 1_000, type: 'image/png' } as unknown as File;
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [] });

    await expect(getAccessToGallery()).resolves.toEqual({ canceled: false, assets: [] });
    await getAccessToGallery(['images', 'videos'], { allowsMultipleSelection: true, selectionLimit: 5 });
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenLastCalledWith(
      expect.objectContaining({ allowsMultipleSelection: true, selectionLimit: 5 }),
    );
    await getAccessToGallery(['images']);
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenLastCalledWith(
      expect.objectContaining({ mediaTypes: ['images'], quality: 1, videoMaxDuration: undefined }),
    );
    await expect(compressMediaFile(webFile)).resolves.toEqual({
      file: webFile,
      originalName: 'photo.png',
      extension: 'png',
      isVideo: false,
      mimeType: 'image/png',
    });
    expect(ImageCompressor.compress).not.toHaveBeenCalled();

    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockRejectedValue(new Error('gallery unavailable'));
    await expect(getAccessToGallery()).resolves.toBeUndefined();
    expect(errorToast).toHaveBeenCalledWith('Не удалось открыть галерею', expect.any(Error));
  });

  it('passes browser videos through without using the native compressor', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const webFile = { name: 'clip.mp4', size: 1_000, type: 'video/mp4' } as unknown as File;
    mockBrowserVideoMetadata(60);

    await expect(compressMediaFile(webFile)).resolves.toEqual({
      file: webFile,
      originalName: 'clip.mp4',
      extension: 'mp4',
      isVideo: true,
      mimeType: 'video/mp4',
    });
    expect(VideoCompressor.compress).not.toHaveBeenCalled();
    expect(getVideoMetaData).not.toHaveBeenCalled();
  });

  it('returns no compressed media when a compressor produces no output', async () => {
    (ImageCompressor.compress as jest.Mock).mockResolvedValue(null);

    await expect(compressMediaFile('photo.jpg')).resolves.toBeNull();
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('rejects oversized browser videos without calling native video services', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const webFile = { name: 'clip.mp4', size: MAX_MEDIA_FILE_SIZE + 1, type: 'video/mp4' } as unknown as File;
    mockBrowserVideoMetadata();

    await expect(compressMediaFile(webFile)).resolves.toBeNull();
    expect(errorToast).toHaveBeenCalledWith('Размер видео должен быть не более 50 МБ');
    expect(getVideoMetaData).not.toHaveBeenCalled();
    expect(VideoCompressor.compress).not.toHaveBeenCalled();
  });

  it('rejects browser and native videos when their duration cannot be read or exceeds one minute', async () => {
    const webFile = { name: 'clip.mp4', size: 1_000, type: 'video/mp4' } as unknown as File;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    mockBrowserVideoMetadata(Number.POSITIVE_INFINITY);
    await expect(compressMediaFile(webFile)).resolves.toBeNull();
    expect(errorToast).toHaveBeenLastCalledWith('Не удалось определить длительность видео');

    mockBrowserVideoMetadata(61);
    await expect(compressMediaFile(webFile)).resolves.toBeNull();
    expect(errorToast).toHaveBeenLastCalledWith('Длительность видео должна быть не более 1 минуты');

    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    (getVideoMetaData as jest.Mock).mockResolvedValueOnce({ size: 1_000, duration: Number.NaN });
    await expect(compressMediaFile('unknown-duration.mp4')).resolves.toBeNull();
    expect(VideoCompressor.compress).not.toHaveBeenCalled();
    expect(errorToast).toHaveBeenLastCalledWith('Не удалось определить длительность видео');

    mockErrorToast.mockClear();
    (VideoCompressor.compress as jest.Mock).mockResolvedValueOnce(null);
    await expect(compressMediaFile('empty-compression.mp4')).resolves.toBeNull();
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('reads browser video URLs as blobs and reports when browser metadata is unavailable', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      blob: async () => new Blob(['video']),
    } as Response);
    mockBrowserVideoMetadata(30);

    await expect(compressMediaFile('https://cdn.example/clip.mp4')).resolves.toMatchObject({
      originalName: 'clip.mp4',
      isVideo: true,
    });
    expect(fetchSpy).toHaveBeenCalledWith('https://cdn.example/clip.mp4');

    restoreGlobalProperty(globalThis, 'document', undefined);
    await expect(compressMediaFile('https://cdn.example/clip.mp4')).resolves.toBeNull();
    expect(errorToast).toHaveBeenLastCalledWith('Ошибка во время сжатия видео', expect.any(Error));
  });

  it('returns null for empty batches and null server results', async () => {
    await expect(uploadMediaFiles([], undefined, [], uploadMediaBatch)).resolves.toEqual([]);
    expect(uploadMediaBatch).not.toHaveBeenCalled();

    uploadMediaBatch.mockResolvedValueOnce(null as never);
    await expect(
      uploadMediaFiles(
        [
          {
            file: 'compressed-image.jpg',
            originalName: 'photo.jpg',
            extension: 'jpg',
            isVideo: false,
            mimeType: 'image/jpeg',
          },
        ],
        undefined,
        [{ mediaId: 'media-1', role: 'media' }],
        uploadMediaBatch,
      ),
    ).resolves.toBeNull();
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('does not show an upload error after cancellation', async () => {
    const controller = new AbortController();
    controller.abort();
    uploadMedia.mockRejectedValueOnce(new Error('aborted'));

    await expect(
      uploadMediaFile(
        {
          file: 'compressed-image.jpg',
          originalName: 'photo.jpg',
          extension: 'jpg',
          isVideo: false,
          mimeType: 'image/jpeg',
        },
        undefined,
        uploadMedia,
        { signal: controller.signal },
      ),
    ).resolves.toBeNull();
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('returns uploads that do not need moderation status polling unchanged', async () => {
    const uploads = [
      { url: 'https://cdn.example/photo.jpg', contentType: 'image/jpeg' },
      {
        assetId: 'asset-with-url',
        status: 'queued' as const,
        url: 'https://cdn.example/video.mp4',
        contentType: 'video/mp4',
      },
    ];

    await expect(waitForMediaUploadReview(uploads)).resolves.toBe(uploads);
  });

  it('publishes an approved upload after the moderation status endpoint releases it', async () => {
    store.dispatch(changeLanguage(LANGUAGES.english));
    const statusRequests: string[] = [];
    server.use(
      http.get(`${BASE_URL}/photo/status`, ({ request }) => {
        statusRequests.push(new URL(request.url).searchParams.get('ids') ?? '');
        return HttpResponse.json({
          items: [{ assetId: 'asset-approved', status: 'approved', contentType: 'image/jpeg' }],
        });
      }),
      http.post(`${BASE_URL}/photo/asset-approved/publish`, () =>
        HttpResponse.json({ url: 'https://cdn.example/approved.jpg', key: 'approved.jpg' }),
      ),
    );

    await expect(
      waitForMediaUploadReview([
        {
          assetId: 'asset-approved',
          status: 'processing',
          contentType: 'image/jpeg',
        },
      ]),
    ).resolves.toEqual([
      {
        assetId: 'asset-approved',
        status: 'approved',
        contentType: 'image/jpeg',
        url: 'https://cdn.example/approved.jpg',
        key: 'approved.jpg',
      },
    ]);
    expect(statusRequests).toEqual(['asset-approved']);
  });

  it('uses an approved URL returned by status polling without publishing the file again', async () => {
    let statusRequests = 0;
    let publishRequests = 0;
    server.use(
      http.get(`${BASE_URL}/photo/status`, () => {
        statusRequests += 1;
        return HttpResponse.json({
          items: [
            {
              assetId: 'asset-already-published',
              status: 'approved',
              url: 'https://cdn.example/already-published.jpg',
              contentType: 'image/jpeg',
            },
          ],
        });
      }),
      http.post(`${BASE_URL}/photo/asset-already-published/publish`, () => {
        publishRequests += 1;
        return HttpResponse.json({ url: 'https://cdn.example/duplicate-publish.jpg', key: 'duplicate.jpg' });
      }),
    );

    await expect(
      waitForMediaUploadReview([
        {
          assetId: 'asset-already-published',
          status: 'processing',
          contentType: 'image/jpeg',
        },
      ]),
    ).resolves.toEqual([
      {
        assetId: 'asset-already-published',
        status: 'approved',
        url: 'https://cdn.example/already-published.jpg',
        contentType: 'image/jpeg',
      },
    ]);

    expect(statusRequests).toBe(1);
    expect(publishRequests).toBe(0);
  });

  it('notifies the user when manual review is required and returns the final rejection', async () => {
    store.dispatch(changeLanguage(LANGUAGES.english));
    let requestCount = 0;
    server.use(
      http.get(`${BASE_URL}/photo/status`, () => {
        requestCount += 1;
        return HttpResponse.json({
          items: [
            {
              assetId: 'asset-review',
              status: requestCount === 1 ? 'review_required' : 'rejected',
              contentType: 'image/jpeg',
            },
          ],
        });
      }),
    );
    let resolveReviewNotice: (() => void) | undefined;
    const reviewNotice = new Promise<void>((resolve) => {
      resolveReviewNotice = resolve;
    });
    const onProgress = jest.fn((progress: number) => {
      if (progress === 0.95) resolveReviewNotice?.();
    });
    const review = waitForMediaUploadReview(
      [{ assetId: 'asset-review', status: 'queued', contentType: 'image/jpeg' }],
      { onProgress },
    );

    await reviewNotice;
    await jest.advanceTimersByTimeAsync(5_000);
    await expect(review).resolves.toEqual([
      {
        assetId: 'asset-review',
        status: 'rejected',
        contentType: 'image/jpeg',
      },
    ]);
    expect(errorToast).toHaveBeenCalledWith('Media sent to moderation. Upload will continue after review');
    expect(requestCount).toBe(2);
  });

  it('shows the Russian review notice once and ignores status updates for unknown uploads', async () => {
    store.dispatch(changeLanguage(LANGUAGES.russian));
    let requestCount = 0;
    server.use(
      http.get(`${BASE_URL}/photo/status`, () => {
        requestCount += 1;
        return HttpResponse.json({
          items: [
            {
              assetId: 'asset-review-repeat',
              status: requestCount < 3 ? 'review_required' : 'rejected',
              contentType: 'image/jpeg',
            },
            { assetId: 'unknown-asset', status: 'rejected', contentType: 'image/jpeg' },
          ],
        });
      }),
    );
    const progressNotifications: number[] = [];
    let resolveFirstReview: (() => void) | undefined;
    let resolveSecondReview: (() => void) | undefined;
    const firstReview = new Promise<void>((resolve) => {
      resolveFirstReview = resolve;
    });
    const secondReview = new Promise<void>((resolve) => {
      resolveSecondReview = resolve;
    });
    const review = waitForMediaUploadReview(
      [{ assetId: 'asset-review-repeat', status: 'queued', contentType: 'image/jpeg' }],
      {
        onProgress: (progress) => {
          progressNotifications.push(progress);
          if (progressNotifications.length === 1) resolveFirstReview?.();
          if (progressNotifications.length === 2) resolveSecondReview?.();
        },
      },
    );

    await firstReview;
    await jest.advanceTimersByTimeAsync(5_000);
    await secondReview;
    await jest.advanceTimersByTimeAsync(5_000);
    await expect(review).resolves.toEqual([
      {
        assetId: 'asset-review-repeat',
        status: 'rejected',
        contentType: 'image/jpeg',
      },
    ]);

    expect(progressNotifications).toEqual([0.95, 0.95]);
    expect(errorToast).toHaveBeenCalledTimes(1);
    expect(errorToast).toHaveBeenCalledWith('Медиа отправлено модератору. Загрузка продолжится после проверки');
    expect(requestCount).toBe(3);
  });

  it('stops status polling immediately when the upload has been cancelled', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      waitForMediaUploadReview([{ assetId: 'asset-cancelled', status: 'queued', contentType: 'image/jpeg' }], {
        signal: controller.signal,
      }),
    ).rejects.toThrow('Загрузка медиафайлов отменена');
  });

  it('does not show a batch upload error after cancellation', async () => {
    const controller = new AbortController();
    controller.abort();
    uploadMediaBatch.mockRejectedValueOnce(new Error('aborted'));

    await expect(
      uploadMediaFiles(
        [
          {
            file: 'compressed-image.jpg',
            originalName: 'photo.jpg',
            extension: 'jpg',
            isVideo: false,
            mimeType: 'image/jpeg',
          },
        ],
        undefined,
        [{ mediaId: 'media-1', role: 'media' }],
        uploadMediaBatch,
        { signal: controller.signal },
      ),
    ).resolves.toBeNull();
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('uses the store-backed single and batch upload requests when no request override is supplied', async () => {
    const singleResponse = {
      url: 'https://cdn.example/single.jpg',
      key: 'single.jpg',
      contentType: 'image/jpeg',
    };
    const batchResponse = [{ ...singleResponse, mediaId: 'media-0', role: 'media' as const }];
    const singleRequest = { unwrap: jest.fn().mockResolvedValue(singleResponse), abort: jest.fn() };
    const batchRequest = { unwrap: jest.fn().mockResolvedValue(batchResponse), abort: jest.fn() };
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    dispatchSpy.mockReturnValueOnce(singleRequest as never).mockReturnValueOnce(batchRequest as never);
    const compressedFile = {
      file: 'compressed.jpg',
      originalName: 'photo.jpg',
      extension: 'jpg',
      isVideo: false,
      mimeType: 'image/jpeg',
    };

    await expect(uploadMediaFile(compressedFile)).resolves.toEqual(singleResponse);
    await expect(uploadMediaFiles([compressedFile])).resolves.toEqual(batchResponse);
    expect(singleRequest.abort).not.toHaveBeenCalled();
    expect(batchRequest.abort).not.toHaveBeenCalled();
  });

  it('attaches and removes abort listeners around store-backed requests', async () => {
    const controller = new AbortController();
    const response = { url: 'https://cdn.example/photo.jpg', key: 'photo.jpg', contentType: 'image/jpeg' };
    const request = { unwrap: jest.fn().mockResolvedValue(response), abort: jest.fn() };
    jest.spyOn(store, 'dispatch').mockReturnValue(request as never);
    const addListener = jest.spyOn(controller.signal, 'addEventListener');
    const removeListener = jest.spyOn(controller.signal, 'removeEventListener');

    await expect(
      uploadMediaFile(
        {
          file: 'compressed.jpg',
          originalName: 'photo.jpg',
          extension: 'jpg',
          isVideo: false,
          mimeType: 'image/jpeg',
        },
        undefined,
        undefined,
        { signal: controller.signal },
      ),
    ).resolves.toEqual(response);
    expect(addListener).toHaveBeenCalledWith('abort', expect.any(Function), { once: true });
    expect(removeListener).toHaveBeenCalledWith('abort', expect.any(Function));
  });

  it('aborts a store-backed request immediately when its signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const request = { unwrap: jest.fn().mockResolvedValue(null), abort: jest.fn() };
    jest.spyOn(store, 'dispatch').mockReturnValue(request as never);

    await expect(
      uploadMediaFile(
        {
          file: 'compressed.jpg',
          originalName: 'photo.jpg',
          extension: 'jpg',
          isVideo: false,
          mimeType: 'image/jpeg',
        },
        undefined,
        undefined,
        { signal: controller.signal },
      ),
    ).resolves.toBeNull();
    expect(request.abort).toHaveBeenCalledTimes(1);
  });

  it('returns a successful result when deleting an empty media list', async () => {
    await expect(deleteUploadedMedia([])).resolves.toBe(true);
  });
});
