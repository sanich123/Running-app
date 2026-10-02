import {
  createMediaUploadFormData,
  createMediaUploadBatchFormData,
  MAX_MEDIA_BATCH_SIZE,
  getMediaFileInfo,
  isSupportedImageExtension,
  SUPPORTED_VIDEO_FILE_EXTENSIONS,
  SUPPORTED_VIDEO_MIME_TYPES,
} from './file-utils';

describe('media file metadata', () => {
  it.each([
    ['clip.mov', 'video/quicktime'],
    ['clip.webm', 'video/webm'],
    ['clip.mp4', 'video/mp4'],
  ])('recognizes %s as %s', (fileName, mimeType) => {
    expect(getMediaFileInfo(fileName)).toMatchObject({
      fileName,
      extension: fileName.split('.').at(-1),
      isVideo: true,
      mimeType,
    });
  });

  it('uses picker metadata when a native URI has no useful extension', () => {
    expect(
      getMediaFileInfo('ph://asset-id', {
        fileName: 'holiday.heic',
        mimeType: 'image/heic',
      }),
    ).toEqual({
      fileName: 'holiday.heic',
      extension: 'heic',
      isVideo: false,
      mimeType: 'image/heic',
    });
  });

  it('uses the picker media type when native metadata has no name or MIME type', () => {
    expect(getMediaFileInfo('ph://video-id', { mediaType: 'video' })).toMatchObject({
      isVideo: true,
      mimeType: 'video/mp4',
    });
  });

  it('allows only common video containers for new uploads', () => {
    expect(SUPPORTED_VIDEO_FILE_EXTENSIONS).toEqual(new Set(['mov', 'mp4', 'webm']));
    expect(SUPPORTED_VIDEO_MIME_TYPES).toEqual(new Set(['video/mp4', 'video/quicktime', 'video/webm']));
  });

  it.each(['avif', 'bmp', 'heic', 'heif', 'ico', 'svg', 'tiff', 'webp'])('supports %s images', (extension) => {
    expect(isSupportedImageExtension(extension)).toBe(true);
  });

  it('keeps the actual MIME type in the native upload descriptor', () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    const body = createMediaUploadFormData({
      file: 'ph://video-id',
      originalName: '',
      extension: 'webm',
      isVideo: true,
      mimeType: 'video/webm',
      uploadOptions: { scope: 'activity' },
    });

    expect(appendSpy).toHaveBeenCalledWith('file', {
      uri: 'ph://video-id',
      name: expect.stringMatching(/\.webm$/),
      type: 'video/webm',
    });
    expect(body.get('scope')).toBe('activity');
    appendSpy.mockRestore();
  });

  it('detects metadata from URLs and browser files with explicit names and media types', () => {
    expect(getMediaFileInfo('https://cdn.example/path/route.MP4?token=one#frame')).toEqual({
      fileName: 'route.MP4',
      extension: 'mp4',
      isVideo: true,
      mimeType: 'video/mp4',
    });
    expect(
      getMediaFileInfo('content://asset-id', {
        fileName: 'recording',
        mimeType: 'application/octet-stream',
        mediaType: 'video',
      }),
    ).toEqual({ fileName: 'recording', extension: '', isVideo: true, mimeType: 'video/mp4' });
    expect(
      getMediaFileInfo('content://asset-id', {
        fileName: 'picture',
        mimeType: 'application/octet-stream',
        mediaType: 'image',
      }),
    ).toEqual({ fileName: 'picture', extension: '', isVideo: false, mimeType: 'image/jpeg' });
    expect(getMediaFileInfo({ name: 'photo.png', size: 3, type: 'image/custom' } as File)).toEqual({
      fileName: 'photo.png',
      extension: 'png',
      isVideo: false,
      mimeType: 'image/custom',
    });
    expect(isSupportedImageExtension('jpg')).toBe(true);
    expect(isSupportedImageExtension('exe')).toBe(false);
  });

  it.each([
    ['video/3gpp', '3gp'],
    ['video/3gpp2', '3g2'],
    ['video/quicktime', 'mov'],
    ['video/x-m4v', 'm4v'],
    ['video/x-matroska', 'mkv'],
    ['video/x-msvideo', 'avi'],
    ['video/x-ms-wmv', 'wmv'],
    ['image/x-icon', 'ico'],
    ['image/svg+xml', 'svg'],
    ['image/png', 'png'],
    ['video/', 'mp4'],
  ])('derives the fallback upload extension for %s', (mimeType, extension) => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    createMediaUploadFormData({
      file: 'file://asset-id',
      originalName: '',
      extension: '',
      isVideo: mimeType.startsWith('video/'),
      mimeType,
      uploadOptions: {},
    });

    expect(appendSpy).toHaveBeenCalledWith(
      'file',
      expect.objectContaining({ name: expect.stringMatching(new RegExp(`\\.${extension}$`)), type: mimeType }),
    );
    appendSpy.mockRestore();
  });

  it('builds batch form data for unknown-size files and optional metadata', () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    const manifest = [{ mediaId: 'route-video', role: 'media' as const }];
    const formData = createMediaUploadBatchFormData({
      files: [
        {
          file: 'content://route-video',
          originalName: 'route.mp4',
          extension: 'mp4',
          isVideo: true,
          mimeType: 'video/mp4',
        },
      ],
      uploadOptions: {},
      manifest,
    });

    expect(formData.get('manifest')).toBe(JSON.stringify(manifest));
    expect(formData.get('scope')).toBeNull();
    expect(appendSpy).toHaveBeenCalledWith('files', {
      uri: 'content://route-video',
      name: 'route.mp4',
      type: 'video/mp4',
    });
    appendSpy.mockRestore();

    expect(() =>
      createMediaUploadBatchFormData({
        files: [],
        uploadOptions: {},
        manifest,
      }),
    ).toThrow('Manifest медиафайлов не совпадает с количеством файлов');
  });

  it('accepts a 250 MB batch and rejects a larger batch', () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append').mockImplementation(() => undefined);
    const createBatch = (size: number) =>
      createMediaUploadBatchFormData({
        files: [
          {
            file: { name: 'route.mp4', size, type: 'video/mp4' } as File,
            originalName: 'route.mp4',
            extension: 'mp4',
            isVideo: true,
            mimeType: 'video/mp4',
          },
        ],
        uploadOptions: { scope: 'activity' },
        manifest: [{ mediaId: 'route-video', role: 'media' }],
      });

    expect(() => createBatch(MAX_MEDIA_BATCH_SIZE)).not.toThrow();
    expect(() => createBatch(MAX_MEDIA_BATCH_SIZE + 1)).toThrow('Суммарный размер файлов не должен превышать 250 МБ');
    appendSpy.mockRestore();
  });
});
