import { errorToast } from '@S/error-toast/error-toast';
import { compressMediaFile, createVideoThumbnail, uploadMediaFile, uploadMediaFiles } from '../file-sending';
import { uploadMediaBatchWithThumbnails, uploadMediaWithThumbnail } from './utils';
import type { CompressedMediaFile, MediaUploadControl } from './file-sending-types';

jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));
jest.mock('../file-sending', () => ({
  compressMediaFile: jest.fn(),
  createVideoThumbnail: jest.fn(),
  uploadMediaFile: jest.fn(),
  uploadMediaFiles: jest.fn(),
}));

const mockCompressMediaFile = compressMediaFile as jest.MockedFunction<typeof compressMediaFile>;
const mockCreateVideoThumbnail = createVideoThumbnail as jest.MockedFunction<typeof createVideoThumbnail>;
const mockUploadMediaFile = uploadMediaFile as jest.MockedFunction<typeof uploadMediaFile>;
const mockUploadMediaFiles = uploadMediaFiles as jest.MockedFunction<typeof uploadMediaFiles>;

const compressedImage = (file = 'compressed.jpg'): CompressedMediaFile => ({
  file,
  originalName: file,
  extension: 'jpg',
  isVideo: false,
  mimeType: 'image/jpeg',
});

const compressedVideo = (file: CompressedMediaFile['file'] = 'compressed.mp4'): CompressedMediaFile => ({
  file,
  originalName: typeof file === 'string' ? file : file.name,
  extension: 'mp4',
  isVideo: true,
  mimeType: 'video/mp4',
});

describe('uploadMediaWithThumbnail', () => {
  beforeEach(() => jest.clearAllMocks());

  it('compresses and uploads an image without creating a thumbnail', async () => {
    const compressedFile = {
      file: 'compressed.jpg',
      originalName: 'photo.jpg',
      extension: 'jpg',
      isVideo: false,
      mimeType: 'image/jpeg',
    };
    mockCompressMediaFile.mockResolvedValue(compressedFile);
    mockUploadMediaFile.mockResolvedValue({
      url: 'https://cdn/photo.jpg',
      key: 'photo.jpg',
      contentType: 'image/jpeg',
    });

    await expect(uploadMediaWithThumbnail('photo.jpg', { scope: 'activity' }, 'Upload failed')).resolves.toEqual({
      url: 'https://cdn/photo.jpg',
      thumbnail: null,
    });
    expect(mockCreateVideoThumbnail).not.toHaveBeenCalled();
  });

  it('uploads a generated video thumbnail with the same options', async () => {
    const compressedVideo = {
      file: 'compressed.mp4',
      originalName: 'video.mp4',
      extension: 'mp4',
      isVideo: true,
      mimeType: 'video/mp4',
    };
    const compressedThumbnail = {
      file: 'compressed-thumbnail.jpg',
      originalName: 'thumbnail.jpg',
      extension: 'jpg',
      isVideo: false,
      mimeType: 'image/jpeg',
    };
    mockCompressMediaFile.mockResolvedValueOnce(compressedVideo).mockResolvedValueOnce(compressedThumbnail);
    mockUploadMediaFile
      .mockResolvedValueOnce({ url: 'https://cdn/video.mp4', key: 'video.mp4', contentType: 'video/mp4' })
      .mockResolvedValueOnce({ url: 'https://cdn/thumbnail.jpg', key: 'thumbnail.jpg', contentType: 'image/jpeg' });
    mockCreateVideoThumbnail.mockResolvedValue('thumbnail.jpg');
    const options = { scope: 'feedback' as const, feedbackId: 'feedback-id' };

    await expect(uploadMediaWithThumbnail('video.mp4', options, 'Upload failed')).resolves.toEqual({
      url: 'https://cdn/video.mp4',
      thumbnail: 'https://cdn/thumbnail.jpg',
    });
    expect(mockUploadMediaFile).toHaveBeenNthCalledWith(1, compressedVideo, options);
    expect(mockUploadMediaFile).toHaveBeenNthCalledWith(2, compressedThumbnail, options);
  });

  it('returns null when compression or upload produces no file', async () => {
    mockCompressMediaFile.mockResolvedValueOnce(null).mockResolvedValueOnce(compressedImage());
    mockUploadMediaFile.mockResolvedValue(null);

    await expect(uploadMediaWithThumbnail('photo.jpg', {}, 'Upload failed')).resolves.toBeNull();
    await expect(uploadMediaWithThumbnail('photo.jpg', {}, 'Upload failed')).resolves.toBeNull();
    expect(mockUploadMediaFile).toHaveBeenCalledTimes(1);
  });

  it('keeps an uploaded video when thumbnail generation or compression fails', async () => {
    mockCompressMediaFile
      .mockResolvedValueOnce(compressedVideo())
      .mockResolvedValueOnce(compressedVideo())
      .mockResolvedValueOnce(null);
    mockUploadMediaFile.mockResolvedValue({ url: 'https://cdn/video.mp4', key: 'video.mp4', contentType: 'video/mp4' });
    mockCreateVideoThumbnail.mockResolvedValueOnce(null).mockResolvedValueOnce('thumbnail.jpg');

    await expect(uploadMediaWithThumbnail('video.mp4', {}, 'Upload failed')).resolves.toEqual({
      url: 'https://cdn/video.mp4',
      thumbnail: null,
    });
    await expect(uploadMediaWithThumbnail('video.mp4', {}, 'Upload failed')).resolves.toEqual({
      url: 'https://cdn/video.mp4',
      thumbnail: null,
    });
    expect(mockUploadMediaFile).toHaveBeenCalledTimes(2);
  });

  it('reports upload progress and suppresses errors for an aborted upload', async () => {
    const onProgress = jest.fn();
    const control: MediaUploadControl = { onProgress };
    mockCompressMediaFile.mockResolvedValue(compressedImage());
    mockUploadMediaFile.mockResolvedValue({
      url: 'https://cdn/photo.jpg',
      key: 'photo.jpg',
      contentType: 'image/jpeg',
    });

    await expect(uploadMediaWithThumbnail('photo.jpg', {}, 'Upload failed', undefined, control)).resolves.toEqual({
      url: 'https://cdn/photo.jpg',
      thumbnail: null,
    });
    expect(onProgress.mock.calls.map(([progress]) => progress)).toEqual([0.25, 0.8, 1]);

    jest.clearAllMocks();
    const controller = new AbortController();
    controller.abort();
    await expect(
      uploadMediaWithThumbnail('photo.jpg', {}, 'Upload failed', undefined, { signal: controller.signal }),
    ).resolves.toBeNull();
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('shows an error toast when the workflow fails unexpectedly', async () => {
    const error = new Error('unexpected failure');
    mockCompressMediaFile.mockRejectedValue(error);

    await expect(uploadMediaWithThumbnail('photo.jpg', { scope: 'activity' }, 'Upload failed')).resolves.toBeNull();
    expect(errorToast).toHaveBeenCalledWith('Upload failed', error);
  });

  it('uploads several media files with an aligned media manifest', async () => {
    mockCompressMediaFile
      .mockResolvedValueOnce({
        file: 'compressed-one.jpg',
        originalName: 'one.jpg',
        extension: 'jpg',
        isVideo: false,
        mimeType: 'image/jpeg',
      })
      .mockResolvedValueOnce({
        file: 'compressed-two.jpg',
        originalName: 'two.jpg',
        extension: 'jpg',
        isVideo: false,
        mimeType: 'image/jpeg',
      });
    mockUploadMediaFiles.mockResolvedValue([
      {
        url: 'https://cdn/one.jpg',
        key: 'one.jpg',
        contentType: 'image/jpeg',
        mediaId: 'media-1',
        role: 'media',
      },
      {
        url: 'https://cdn/two.jpg',
        key: 'two.jpg',
        contentType: 'image/jpeg',
        mediaId: 'media-2',
        role: 'media',
      },
    ]);

    await expect(
      uploadMediaBatchWithThumbnails(
        [
          { fileSrc: 'one.jpg', mediaId: 'media-1' },
          { fileSrc: 'two.jpg', mediaId: 'media-2' },
        ],
        { scope: 'activity' },
        'Upload failed',
      ),
    ).resolves.toEqual([
      { url: 'https://cdn/one.jpg', thumbnail: null },
      { url: 'https://cdn/two.jpg', thumbnail: null },
    ]);
    expect(mockUploadMediaFiles).toHaveBeenCalledWith(expect.any(Array), { scope: 'activity' }, [
      { mediaId: 'media-1', role: 'media' },
      { mediaId: 'media-2', role: 'media' },
    ]);
  });

  it('uploads a video thumbnail in a second manifest batch with the same mediaId', async () => {
    mockCompressMediaFile
      .mockResolvedValueOnce({
        file: 'compressed-video.mp4',
        originalName: 'video.mp4',
        extension: 'mp4',
        isVideo: true,
        mimeType: 'video/mp4',
      })
      .mockResolvedValueOnce({
        file: 'compressed-thumbnail.jpg',
        originalName: 'thumbnail.jpg',
        extension: 'jpg',
        isVideo: false,
        mimeType: 'image/jpeg',
      });
    mockCreateVideoThumbnail.mockResolvedValue('thumbnail.jpg');
    mockUploadMediaFiles
      .mockResolvedValueOnce([
        {
          url: 'https://cdn/video.mp4',
          key: 'video.mp4',
          contentType: 'video/mp4',
          mediaId: 'video-1',
          role: 'media',
        },
      ])
      .mockResolvedValueOnce([
        {
          url: 'https://cdn/video-thumbnail.jpg',
          key: 'video-thumbnail.jpg',
          contentType: 'image/jpeg',
          mediaId: 'video-1',
          role: 'thumbnail',
        },
      ]);

    await expect(
      uploadMediaBatchWithThumbnails([{ fileSrc: 'video.mp4', mediaId: 'video-1' }], {}, 'Upload failed'),
    ).resolves.toEqual([{ url: 'https://cdn/video.mp4', thumbnail: 'https://cdn/video-thumbnail.jpg' }]);
    expect(mockUploadMediaFiles).toHaveBeenNthCalledWith(2, expect.any(Array), {}, [
      { mediaId: 'video-1', role: 'thumbnail' },
    ]);
  });

  it('returns aligned null results for empty, rejected, or fully compressed-away batches', async () => {
    await expect(uploadMediaBatchWithThumbnails([], {}, 'Upload failed')).resolves.toEqual([]);
    mockCompressMediaFile.mockResolvedValue(null);
    await expect(
      uploadMediaBatchWithThumbnails(
        [
          { fileSrc: 'one.jpg', mediaId: 'one' },
          { fileSrc: 'two.jpg', mediaId: 'two' },
        ],
        {},
        'Upload failed',
      ),
    ).resolves.toEqual([null, null]);
    expect(mockUploadMediaFiles).not.toHaveBeenCalled();

    mockCompressMediaFile.mockResolvedValue(compressedImage());
    mockUploadMediaFiles.mockResolvedValue(null);
    await expect(
      uploadMediaBatchWithThumbnails([{ fileSrc: 'one.jpg', mediaId: 'one' }], {}, 'Upload failed'),
    ).resolves.toEqual([null]);
  });

  it('reports bounded batch progress and tolerates missing media manifest entries', async () => {
    const onProgress = jest.fn();
    const control: MediaUploadControl = { onProgress };
    mockCompressMediaFile.mockResolvedValue(compressedImage());
    mockUploadMediaFiles.mockResolvedValue([
      {
        url: 'https://cdn/other.jpg',
        key: 'other.jpg',
        contentType: 'image/jpeg',
        mediaId: 'not-requested',
        role: 'media',
      },
    ]);

    await expect(
      uploadMediaBatchWithThumbnails([{ fileSrc: 'photo.jpg', mediaId: 'photo' }], {}, 'Upload failed', control),
    ).resolves.toEqual([null]);
    expect(onProgress).toHaveBeenCalledWith(0.2);
    expect(mockUploadMediaFiles).toHaveBeenCalledWith(
      expect.any(Array),
      {},
      [{ mediaId: 'photo', role: 'media' }],
      undefined,
      expect.objectContaining({ signal: undefined, onProgress: expect.any(Function) }),
    );
  });

  it('skips missing video thumbnails and suppresses batch errors after cancellation', async () => {
    mockCompressMediaFile.mockResolvedValue(compressedVideo());
    mockUploadMediaFiles.mockResolvedValue([
      {
        url: 'https://cdn/video.mp4',
        key: 'video.mp4',
        contentType: 'video/mp4',
        mediaId: 'video',
        role: 'media',
      },
    ]);
    mockCreateVideoThumbnail.mockResolvedValue(null);

    await expect(
      uploadMediaBatchWithThumbnails([{ fileSrc: 'video.mp4', mediaId: 'video' }], {}, 'Upload failed'),
    ).resolves.toEqual([{ url: 'https://cdn/video.mp4', thumbnail: null }]);

    jest.clearAllMocks();
    const controller = new AbortController();
    controller.abort();
    await expect(
      uploadMediaBatchWithThumbnails([{ fileSrc: 'video.mp4', mediaId: 'video' }], {}, 'Upload failed', {
        signal: controller.signal,
      }),
    ).resolves.toEqual([null]);
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('stops a batch when cancellation happens after compression', async () => {
    const controller = new AbortController();
    mockCompressMediaFile.mockImplementation(async () => {
      controller.abort();
      return compressedImage();
    });

    await expect(
      uploadMediaBatchWithThumbnails([{ fileSrc: 'photo.jpg', mediaId: 'photo' }], {}, 'Upload failed', {
        signal: controller.signal,
      }),
    ).resolves.toEqual([null]);
    expect(mockUploadMediaFiles).not.toHaveBeenCalled();
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('uses the uploaded video URL for browser thumbnails and tolerates a failed thumbnail upload', async () => {
    const browserVideo = { name: 'video.mp4', size: 10, type: 'video/mp4' } as File;
    mockCompressMediaFile.mockResolvedValueOnce(compressedVideo(browserVideo)).mockResolvedValueOnce(compressedImage());
    mockUploadMediaFiles
      .mockResolvedValueOnce([
        {
          url: 'https://cdn/video.mp4',
          key: 'video.mp4',
          contentType: 'video/mp4',
          mediaId: 'video',
          role: 'media',
        },
      ])
      .mockResolvedValueOnce(null);
    mockCreateVideoThumbnail.mockResolvedValue('browser-thumbnail.jpg');

    await expect(
      uploadMediaBatchWithThumbnails([{ fileSrc: browserVideo, mediaId: 'video' }], {}, 'Upload failed'),
    ).resolves.toEqual([{ url: 'https://cdn/video.mp4', thumbnail: null }]);
    expect(mockCreateVideoThumbnail).toHaveBeenCalledWith('https://cdn/video.mp4');
    expect(mockUploadMediaFiles).toHaveBeenCalledTimes(2);
  });

  it('uses an uploaded video URL for the individual browser thumbnail and tolerates a failed upload', async () => {
    const browserVideo = { name: 'video.mp4', size: 10, type: 'video/mp4' } as File;
    mockCompressMediaFile.mockResolvedValueOnce(compressedVideo(browserVideo)).mockResolvedValueOnce(compressedImage());
    mockUploadMediaFile
      .mockResolvedValueOnce({ url: 'https://cdn/video.mp4', key: 'video.mp4', contentType: 'video/mp4' })
      .mockResolvedValueOnce(null);
    mockCreateVideoThumbnail.mockResolvedValue('browser-thumbnail.jpg');

    await expect(uploadMediaWithThumbnail(browserVideo, {}, 'Upload failed')).resolves.toEqual({
      url: 'https://cdn/video.mp4',
      thumbnail: null,
    });
    expect(mockCreateVideoThumbnail).toHaveBeenCalledWith('https://cdn/video.mp4');
  });
});
