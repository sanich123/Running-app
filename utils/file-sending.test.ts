import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Image as ImageCompressor, Video as VideoCompressor, getVideoMetaData } from 'react-native-compressor';
import { Platform } from 'react-native';
import { getBase64CodedImage, getPublicUrl, uploadPhoto } from '@A/supabase/storage/upload-photo';
import { errorToast } from '@S/error-toast/error-toast';
import { compressAndSendFile, getAccessToGallery } from './file-sending';

jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('expo-video-thumbnails', () => ({ getThumbnailAsync: jest.fn() }));
jest.mock('react-native-compressor', () => ({
  Image: { compress: jest.fn() },
  Video: { compress: jest.fn() },
  getVideoMetaData: jest.fn(),
}));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));
jest.mock('@A/supabase/storage/upload-photo', () => ({
  getBase64CodedImage: jest.fn(),
  getPublicUrl: jest.fn(),
  uploadPhoto: jest.fn(),
}));

const originalPlatform = Platform.OS;

describe('file sending', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    (ImageCompressor.compress as jest.Mock).mockResolvedValue('compressed-image.jpg');
    (VideoCompressor.compress as jest.Mock).mockResolvedValue('compressed-video.mp4');
    (getVideoMetaData as jest.Mock).mockResolvedValue({ size: 1_000 });
    (getBase64CodedImage as jest.Mock).mockResolvedValue('encoded-file');
    (uploadPhoto as jest.Mock).mockResolvedValue('photos/user/photo.jpg');
    (getPublicUrl as jest.Mock).mockResolvedValue('https://cdn.example/photo.jpg');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
  });

  it('compresses and uploads an image, preserving the image-only response shape', async () => {
    await expect(compressAndSendFile('photo.JPG?cache=1', 'user-id')).resolves.toEqual({
      url: 'https://cdn.example/photo.jpg',
      thumbnail: null,
    });
    expect(ImageCompressor.compress).toHaveBeenCalledWith('photo.JPG?cache=1');
    expect(uploadPhoto).toHaveBeenCalledWith('user-id', 'encoded-file', 'jpg');
  });

  it('uploads a video together with a generated and compressed thumbnail', async () => {
    (uploadPhoto as jest.Mock)
      .mockResolvedValueOnce('photos/user/video.mp4')
      .mockResolvedValueOnce('photos/user/thumbnail.jpg');
    (getPublicUrl as jest.Mock)
      .mockResolvedValueOnce('https://cdn.example/video.mp4')
      .mockResolvedValueOnce('https://cdn.example/thumbnail.jpg');
    (VideoThumbnails.getThumbnailAsync as jest.Mock).mockResolvedValue({ uri: 'thumbnail.jpg' });

    await expect(compressAndSendFile('activity.MP4', 'user-id')).resolves.toEqual({
      url: 'https://cdn.example/video.mp4',
      thumbnail: 'https://cdn.example/thumbnail.jpg',
    });
    expect(VideoCompressor.compress).toHaveBeenCalledWith('activity.MP4');
    expect(VideoThumbnails.getThumbnailAsync).toHaveBeenCalledWith('https://cdn.example/video.mp4');
    expect(ImageCompressor.compress).toHaveBeenCalledWith('thumbnail.jpg');
  });

  it('returns null for an oversized video and leaves unsupported files uncompressed', async () => {
    (getVideoMetaData as jest.Mock).mockResolvedValue({ size: 15_001 });
    await expect(compressAndSendFile('large.mp4', 'user-id')).resolves.toBeNull();
    expect(VideoCompressor.compress).not.toHaveBeenCalled();

    await expect(compressAndSendFile('document.pdf', 'user-id')).resolves.toBeNull();
    expect(errorToast).toHaveBeenCalledWith('Такое разрешение нельзя использовать для изображения');
  });

  it('reports compression failures and stops when an intermediate upload result is missing', async () => {
    (ImageCompressor.compress as jest.Mock).mockRejectedValue(new Error('image compression failed'));
    await expect(compressAndSendFile('photo.jpg', 'user-id')).resolves.toBeNull();
    expect(errorToast).toHaveBeenCalledWith('Ошибка во время сжатия изображения', expect.any(Error));

    (ImageCompressor.compress as jest.Mock).mockResolvedValue('compressed.jpg');
    (getBase64CodedImage as jest.Mock).mockResolvedValue(undefined);
    await expect(compressAndSendFile('photo.jpg', 'user-id')).resolves.toBeUndefined();

    (getBase64CodedImage as jest.Mock).mockResolvedValue('encoded-file');
    (uploadPhoto as jest.Mock).mockResolvedValue(undefined);
    await expect(compressAndSendFile('photo.jpg', 'user-id')).resolves.toBeUndefined();
  });

  it('uses the web file as-is and handles gallery access errors', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const webFile = { name: 'photo.png' } as unknown as File;
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [] });

    await expect(getAccessToGallery()).resolves.toEqual({ canceled: false, assets: [] });
    await expect(compressAndSendFile(webFile, 'user-id')).resolves.toEqual({
      url: 'https://cdn.example/photo.jpg',
      thumbnail: null,
    });
    expect(ImageCompressor.compress).not.toHaveBeenCalled();

    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockRejectedValue(new Error('gallery unavailable'));
    await expect(getAccessToGallery()).resolves.toBeUndefined();
    expect(errorToast).toHaveBeenCalledWith('Не удалось открыть галерею', expect.any(Error));
  });
});
