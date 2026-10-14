import { uploadMediaWithThumbnail } from '@U/file-sending/utils';
import { uploadActivityMedia } from './utils';

jest.mock('@U/file-sending/utils', () => ({
  uploadMediaBatchWithThumbnails: jest.fn(),
  uploadMediaWithThumbnail: jest.fn(),
}));

describe('save activity media utils', () => {
  it('uses empty metadata when it is omitted', async () => {
    const uploadedMedia = { url: 'https://cdn.example.test/activity.jpg', thumbnail: null };
    (uploadMediaWithThumbnail as jest.Mock).mockResolvedValue(uploadedMedia);

    await expect(uploadActivityMedia('activity.jpg')).resolves.toEqual(uploadedMedia);
    expect(uploadMediaWithThumbnail).toHaveBeenCalledWith(
      'activity.jpg',
      { scope: 'activity' },
      'Не удалось добавить медиа к активности',
      {},
    );
  });
});
