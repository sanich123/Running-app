import {
  createMediaUploadFormData,
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
});
