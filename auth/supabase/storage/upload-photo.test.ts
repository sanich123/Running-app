import { decode, encode } from 'base64-arraybuffer';
import { File as ExpoFile } from 'expo-file-system';
import { Platform } from 'react-native';
import { errorToast } from '@S/error-toast/error-toast';
import { supabase } from '../supabase-init';
import { getBase64CodedImage, getPublicUrl, removePhotos, uploadPhoto } from './upload-photo';

jest.mock('expo-file-system', () => ({ File: jest.fn() }));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));
jest.mock('../supabase-init', () => ({
  supabase: { storage: { from: jest.fn() } },
}));

class BrowserFile {
  name = 'photo.jpg';
}

const originalPlatform = Platform.OS;
const originalFile = globalThis.File;
const storageFrom = supabase.storage.from as jest.Mock;

describe('Supabase photo storage helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    Object.defineProperty(globalThis, 'File', { configurable: true, value: BrowserFile });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
    Object.defineProperty(globalThis, 'File', { configurable: true, value: originalFile });
  });

  it('encodes native file bytes and returns browser files without reading them', async () => {
    const bytes = new Uint8Array([1, 2, 3]);
    (ExpoFile as unknown as jest.Mock).mockImplementation(() => ({ bytes: jest.fn().mockResolvedValue(bytes) }));

    await expect(getBase64CodedImage('file://photo.jpg')).resolves.toBe(encode(bytes.buffer));
    expect(ExpoFile).toHaveBeenCalledWith('file://photo.jpg');

    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const browserFile = new BrowserFile();
    await expect(getBase64CodedImage(browserFile as unknown as File)).resolves.toBe(browserFile);
    expect(ExpoFile).toHaveBeenCalledTimes(1);
  });

  it('reports file read failures', async () => {
    (ExpoFile as unknown as jest.Mock).mockImplementation(() => ({
      bytes: jest.fn().mockRejectedValue(new Error('read failed')),
    }));

    await expect(getBase64CodedImage('file://broken.jpg')).resolves.toBeUndefined();
    expect(errorToast).toHaveBeenCalledWith('Не удалось обработать файл', expect.any(Error));
  });

  it('uploads images and videos with the matching content type', async () => {
    const upload = jest
      .fn()
      .mockResolvedValueOnce({ data: { path: 'user/photo.jpg' }, error: null })
      .mockResolvedValueOnce({ data: { path: 'user/video.mp4' }, error: null });
    storageFrom.mockReturnValue({ upload });

    await expect(uploadPhoto('user', encode(new Uint8Array([1]).buffer), 'jpg')).resolves.toBe('user/photo.jpg');
    await expect(uploadPhoto('user', encode(new Uint8Array([1]).buffer), 'mp4')).resolves.toBe('user/video.mp4');
    expect(upload).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/^user\/\d+\.jpg$/),
      decode(encode(new Uint8Array([1]).buffer)),
      { contentType: 'image/jpeg' },
    );
    expect(upload).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/^user\/\d+\.mp4$/),
      decode(encode(new Uint8Array([1]).buffer)),
      { contentType: 'video/mp4' },
    );
  });

  it('supports browser file uploads and reports Supabase upload failures', async () => {
    const upload = jest.fn().mockResolvedValueOnce({ data: { path: 'user/browser.jpg' }, error: null });
    storageFrom.mockReturnValue({ upload });
    const browserFile = new BrowserFile();
    await expect(uploadPhoto('user', browserFile as unknown as File, 'jpg')).resolves.toBe('user/browser.jpg');
    expect(upload.mock.calls[0][1]).toBe(browserFile);

    upload.mockResolvedValueOnce({ data: null, error: { message: 'quota exceeded' } });
    await expect(uploadPhoto('user', 'AQI=', 'jpg')).resolves.toBeUndefined();
    expect(errorToast).toHaveBeenCalledWith('Не удалось загрузить файл: quota exceeded', expect.any(Object));

    upload.mockRejectedValueOnce(new Error('network down'));
    await expect(uploadPhoto('user', 'AQI=', 'jpg')).resolves.toBeUndefined();
    expect(errorToast).toHaveBeenCalledWith('Не удалось загрузить файл', expect.any(Error));
  });

  it('returns public URLs and handles missing or thrown responses', async () => {
    storageFrom.mockReturnValueOnce({ getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://cdn/photo.jpg' } })) });
    await expect(getPublicUrl('user/photo.jpg')).resolves.toBe('https://cdn/photo.jpg');

    storageFrom.mockReturnValueOnce({ getPublicUrl: jest.fn(() => ({ data: undefined })) });
    await expect(getPublicUrl('user/photo.jpg')).resolves.toBeUndefined();

    storageFrom.mockImplementationOnce(() => {
      throw new Error('storage unavailable');
    });
    await expect(getPublicUrl('user/photo.jpg')).resolves.toBeUndefined();
    expect(errorToast).toHaveBeenCalledWith('Не удалось получить ссылку на файл', expect.any(Error));
  });

  it('groups valid photo locations by bucket and handles all removal outcomes', async () => {
    const remove = jest.fn().mockResolvedValue({ error: null });
    storageFrom.mockReturnValue({ remove });
    await expect(
      removePhotos([
        'https://host/storage/v1/object/public/photos/folder%20a.jpg',
        'https://host/storage/v1/object/public/photos/second.jpg',
        'https://host/storage/v1/object/public/videos/video.mp4',
        'https://host/not-a-storage-url',
        'https://host/storage/v1/object/public/photos',
      ]),
    ).resolves.toBe(true);
    expect(remove).toHaveBeenCalledWith(['folder a.jpg', 'second.jpg']);
    expect(remove).toHaveBeenCalledWith(['video.mp4']);

    await expect(removePhotos(['invalid'])).resolves.toBe(true);

    remove.mockResolvedValueOnce({ error: { message: 'remove failed' } });
    await expect(removePhotos(['https://host/storage/v1/object/public/photos/photo.jpg'])).resolves.toBe(false);
    expect(errorToast).toHaveBeenCalledWith('Не удалось удалить фото', expect.any(Object));

    remove.mockRejectedValueOnce(new Error('remove crashed'));
    await expect(removePhotos(['https://host/storage/v1/object/public/photos/photo.jpg'])).resolves.toBe(false);
    expect(errorToast).toHaveBeenCalledWith('Не удалось удалить фото', expect.any(Error));
  });

  it('keeps a malformed encoded path removable', async () => {
    const remove = jest.fn().mockResolvedValue({ error: null });
    storageFrom.mockReturnValue({ remove });

    await expect(removePhotos(['https://host/storage/v1/object/public/photos/bad%ZZ.jpg'])).resolves.toBe(true);
    expect(remove).toHaveBeenCalledWith(['bad%ZZ.jpg']);
  });
});
