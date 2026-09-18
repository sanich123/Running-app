import { errorToast } from '@S/error-toast/error-toast';
import { compressMediaFile, createVideoThumbnail, uploadMediaFile, uploadMediaFiles } from '../file-sending';
import { uploadMediaBatchWithThumbnails, uploadMediaWithThumbnail } from './utils';

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
});
