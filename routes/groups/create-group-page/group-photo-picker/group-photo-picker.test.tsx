import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupPhotoPicker from './group-photo-picker';
import { GROUPS_COPY } from '../../const';

const mockGetAccessToGallery = jest.fn();
const mockCompressMediaFile = jest.fn();
const mockUploadMediaFile = jest.fn();
const mockErrorToast = jest.fn();

jest.mock('@S/error-toast/error-toast', () => ({ errorToast: (...args: unknown[]) => mockErrorToast(...args) }));
jest.mock('@U/file-sending', () => ({
  getAccessToGallery: (...args: unknown[]) => mockGetAccessToGallery(...args),
  compressMediaFile: (...args: unknown[]) => mockCompressMediaFile(...args),
  uploadMediaFile: (...args: unknown[]) => mockUploadMediaFile(...args),
}));

describe('GroupPhotoPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockGetAccessToGallery.mockResolvedValue({ canceled: true, assets: [] });
    mockCompressMediaFile.mockResolvedValue('file:///compressed.jpg');
    mockUploadMediaFile.mockResolvedValue({ assetId: 'asset-1' });
  });

  it('uploads the selected image as a group photo and returns its moderation asset id', async () => {
    const onPhotoAssetChange = jest.fn();
    mockGetAccessToGallery.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///group.jpg', fileName: 'group.jpg' }],
    });
    await renderWithProviders(
      <GroupPhotoPicker onPhotoAssetChange={onPhotoAssetChange} onUploadingChange={jest.fn()} />,
    );

    await userEvent.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].addPhoto));

    await waitFor(() => expect(onPhotoAssetChange).toHaveBeenLastCalledWith('asset-1'));
    expect(mockUploadMediaFile).toHaveBeenCalledWith('file:///compressed.jpg', { scope: 'group' });
  });

  it('reports a compression failure without throwing or uploading', async () => {
    mockGetAccessToGallery.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///group.jpg', fileName: 'group.jpg' }],
    });
    mockCompressMediaFile.mockResolvedValueOnce(null);
    await renderWithProviders(<GroupPhotoPicker onPhotoAssetChange={jest.fn()} onUploadingChange={jest.fn()} />);

    await userEvent.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].addPhoto));

    await waitFor(() => expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].photoUploadError));
    expect(mockUploadMediaFile).not.toHaveBeenCalled();
  });

  it('reports an upload that does not return a moderation asset id', async () => {
    const onPhotoAssetChange = jest.fn();
    mockGetAccessToGallery.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///group.jpg', fileName: 'group.jpg' }],
    });
    mockUploadMediaFile.mockResolvedValueOnce({});
    await renderWithProviders(
      <GroupPhotoPicker onPhotoAssetChange={onPhotoAssetChange} onUploadingChange={jest.fn()} />,
    );

    await userEvent.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].addPhoto));

    await waitFor(() => expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].photoUploadError));
    expect(onPhotoAssetChange).toHaveBeenLastCalledWith(null);
  });
});
