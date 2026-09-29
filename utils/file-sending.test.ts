import { fetch as getNetworkState } from '@react-native-community/netinfo';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Image as ImageCompressor, Video as VideoCompressor, getVideoMetaData } from 'react-native-compressor';
import { Platform } from 'react-native';
import { store } from '@R/store';
import { errorToast } from '@S/error-toast/error-toast';
import {
  compressMediaFile,
  createVideoThumbnail,
  deleteUploadedMedia,
  getAccessToGallery,
  uploadMediaFile,
  uploadMediaFiles,
  type UploadMediaBatchRequest,
  type UploadMediaRequest,
} from './file-sending';
import { MAX_MEDIA_BATCH_SIZE, MAX_MEDIA_FILE_SIZE } from './file-sending/file-utils';

jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('expo-video-thumbnails', () => ({ getThumbnailAsync: jest.fn() }));
jest.mock('@react-native-community/netinfo', () => ({ fetch: jest.fn() }));
jest.mock('react-native-compressor', () => ({
  Image: { compress: jest.fn() },
  Video: { compress: jest.fn() },
  getVideoMetaData: jest.fn(),
}));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));
const originalPlatform = Platform.OS;
const uploadMedia = jest.fn() as jest.MockedFunction<UploadMediaRequest>;
const uploadMediaBatch = jest.fn() as jest.MockedFunction<UploadMediaBatchRequest>;
const mockGetNetworkState = getNetworkState as jest.MockedFunction<typeof getNetworkState>;

describe('file sending', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    (ImageCompressor.compress as jest.Mock).mockResolvedValue('compressed-image.jpg');
    (VideoCompressor.compress as jest.Mock).mockResolvedValue('compressed-video.mp4');
    (getVideoMetaData as jest.Mock).mockResolvedValue({ size: 1_000 });
    mockGetNetworkState.mockResolvedValue({ isConnected: true, isInternetReachable: true } as never);
    uploadMedia.mockResolvedValue({
      url: 'https://cdn.example/photo.jpg',
      key: 'user/photo.jpg',
      contentType: 'image/jpeg',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
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

  it('warns about an offline network without blocking the upload attempt', async () => {
    mockGetNetworkState.mockResolvedValue({ isConnected: false, isInternetReachable: false } as never);
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
    expect(errorToast).toHaveBeenCalledWith('Отсутствует соединение с Интернет. Попытка загрузки будет продолжена.');
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

  it('rejects a browser batch that is 100 MB or larger before sending it', async () => {
    const oversizedFile = {
      name: 'oversized.jpg',
      size: MAX_MEDIA_BATCH_SIZE,
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
      expect.objectContaining({ message: 'Суммарный размер файлов должен быть меньше 100 МБ' }),
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
    expect(VideoCompressor.compress).toHaveBeenCalledWith('activity.MP4');

    const thumbnail = await createVideoThumbnail('https://cdn.example/video.mp4');
    expect(thumbnail).toBeNull();
    expect(errorToast).toHaveBeenCalledWith('Не удалось создать превью видео', expect.anything());
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

    (getVideoMetaData as jest.Mock).mockResolvedValue({ size: 15 * 1024 * 1024 + 1 });
    await expect(compressMediaFile('large.mp4')).resolves.toBeNull();
    expect(VideoCompressor.compress).not.toHaveBeenCalled();
    expect(errorToast).toHaveBeenCalledWith('Файл слишком большой, размер файла не более 15 МБ');
  });

  it('reports compression, upload and thumbnail errors independently', async () => {
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
    expect(errorToast).toHaveBeenCalledWith('Не удалось создать превью видео', thumbnailError);
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

    await expect(compressMediaFile(webFile)).resolves.toBeNull();
    expect(errorToast).toHaveBeenCalledWith('Файл слишком большой, размер файла не более 15 МБ');
    expect(getVideoMetaData).not.toHaveBeenCalled();
    expect(VideoCompressor.compress).not.toHaveBeenCalled();
  });

  it('allows upload to proceed when network state lookup fails or is unknown', async () => {
    mockGetNetworkState.mockRejectedValueOnce(new Error('network state unavailable'));
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
    mockGetNetworkState.mockResolvedValueOnce({ isConnected: null, isInternetReachable: null } as never);
    await expect(uploadMediaFile(compressedFile, undefined, uploadMedia)).resolves.toEqual(
      expect.objectContaining({ url: 'https://cdn.example/photo.jpg' }),
    );
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('returns null for empty batches and null server results', async () => {
    await expect(uploadMediaFiles([], undefined, [], uploadMediaBatch)).resolves.toEqual([]);
    expect(mockGetNetworkState).not.toHaveBeenCalled();
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
