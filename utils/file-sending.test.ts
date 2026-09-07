import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Image as ImageCompressor, Video as VideoCompressor, getVideoMetaData } from 'react-native-compressor';
import { Platform } from 'react-native';
import { errorToast } from '@S/error-toast/error-toast';
import { compressAndSendFile, getAccessToGallery, type SendPhoto } from './file-sending';

jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('expo-video-thumbnails', () => ({ getThumbnailAsync: jest.fn() }));
jest.mock('react-native-compressor', () => ({
  Image: { compress: jest.fn() },
  Video: { compress: jest.fn() },
  getVideoMetaData: jest.fn(),
}));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));
const originalPlatform = Platform.OS;
const sendPhoto = jest.fn() as jest.MockedFunction<SendPhoto>;

describe('file sending', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    (ImageCompressor.compress as jest.Mock).mockResolvedValue('compressed-image.jpg');
    (VideoCompressor.compress as jest.Mock).mockResolvedValue('compressed-video.mp4');
    (getVideoMetaData as jest.Mock).mockResolvedValue({ size: 1_000 });
    sendPhoto.mockResolvedValue({
      url: 'https://cdn.example/photo.jpg',
      key: 'user/photo.jpg',
      contentType: 'image/jpeg',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
  });

  it('compresses and uploads an image, preserving the image-only response shape', async () => {
    await expect(compressAndSendFile('photo.JPG?cache=1', 'user-id', sendPhoto)).resolves.toEqual({
      url: 'https://cdn.example/photo.jpg',
      thumbnail: null,
    });
    expect(ImageCompressor.compress).toHaveBeenCalledWith('photo.JPG?cache=1');
    expect(sendPhoto).toHaveBeenCalledWith(expect.any(FormData));
  });

  it('uploads a video together with a generated and compressed thumbnail', async () => {
    sendPhoto
      .mockResolvedValueOnce({ url: 'https://cdn.example/video.mp4', key: 'user/video.mp4', contentType: 'video/mp4' })
      .mockResolvedValueOnce({
        url: 'https://cdn.example/thumbnail.jpg',
        key: 'user/thumbnail.jpg',
        contentType: 'image/jpeg',
      });
    (VideoThumbnails.getThumbnailAsync as jest.Mock).mockResolvedValue({ uri: 'thumbnail.jpg' });

    await expect(compressAndSendFile('activity.MP4', 'user-id', sendPhoto)).resolves.toEqual({
      url: 'https://cdn.example/video.mp4',
      thumbnail: 'https://cdn.example/thumbnail.jpg',
    });
    expect(VideoCompressor.compress).toHaveBeenCalledWith('activity.MP4');
    expect(VideoThumbnails.getThumbnailAsync).toHaveBeenCalledWith('https://cdn.example/video.mp4');
    expect(ImageCompressor.compress).toHaveBeenCalledWith('thumbnail.jpg');
  });

  it('returns null for an oversized video and leaves unsupported files uncompressed', async () => {
    (getVideoMetaData as jest.Mock).mockResolvedValue({ size: 15_001 });
    await expect(compressAndSendFile('large.mp4', 'user-id', sendPhoto)).resolves.toBeNull();
    expect(VideoCompressor.compress).not.toHaveBeenCalled();

    await expect(compressAndSendFile('document.pdf', 'user-id', sendPhoto)).resolves.toBeNull();
    expect(errorToast).toHaveBeenCalledWith('Такое разрешение нельзя использовать для изображения');
  });

  it('reports compression failures and stops when an intermediate upload result is missing', async () => {
    (ImageCompressor.compress as jest.Mock).mockRejectedValue(new Error('image compression failed'));
    await expect(compressAndSendFile('photo.jpg', 'user-id', sendPhoto)).resolves.toBeNull();
    expect(errorToast).toHaveBeenCalledWith('Ошибка во время сжатия изображения', expect.any(Error));

    (ImageCompressor.compress as jest.Mock).mockResolvedValue('compressed.jpg');
    sendPhoto.mockResolvedValueOnce(undefined as never);
    await expect(compressAndSendFile('photo.jpg', 'user-id', sendPhoto)).resolves.toBeUndefined();

    sendPhoto.mockResolvedValueOnce(undefined as never);
    await expect(compressAndSendFile('photo.jpg', 'user-id', sendPhoto)).resolves.toBeUndefined();
  });

  it('uses the web file as-is and handles gallery access errors', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const webFile = { name: 'photo.png' } as unknown as File;
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [] });

    await expect(getAccessToGallery()).resolves.toEqual({ canceled: false, assets: [] });
    await expect(compressAndSendFile(webFile, 'user-id', sendPhoto)).resolves.toEqual({
      url: 'https://cdn.example/photo.jpg',
      thumbnail: null,
    });
    expect(ImageCompressor.compress).not.toHaveBeenCalled();

    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockRejectedValue(new Error('gallery unavailable'));
    await expect(getAccessToGallery()).resolves.toBeUndefined();
    expect(errorToast).toHaveBeenCalledWith('Не удалось открыть галерею', expect.any(Error));
  });
});
