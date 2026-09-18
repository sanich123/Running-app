import { errorToast } from '@S/error-toast/error-toast';
import { compressMediaFile, createVideoThumbnail, uploadMediaFile } from '../file-sending';
import { uploadMediaWithThumbnail } from './utils';

jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));
jest.mock('../file-sending', () => ({
  compressMediaFile: jest.fn(),
  createVideoThumbnail: jest.fn(),
  uploadMediaFile: jest.fn(),
}));

const mockCompressMediaFile = compressMediaFile as jest.MockedFunction<typeof compressMediaFile>;
const mockCreateVideoThumbnail = createVideoThumbnail as jest.MockedFunction<typeof createVideoThumbnail>;
const mockUploadMediaFile = uploadMediaFile as jest.MockedFunction<typeof uploadMediaFile>;

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
});
