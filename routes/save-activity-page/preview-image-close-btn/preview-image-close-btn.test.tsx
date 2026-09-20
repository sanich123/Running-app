import { screen, userEvent } from '@testing-library/react-native';
import { addPhotoUrl, setSavingDisabled } from '@R/slices/activity/activity';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { deleteUploadedMedia } from '@U/file-sending';
import PreviewImageCloseBtn from './preview-image-close-btn';

jest.mock('@U/file-sending', () => ({ deleteUploadedMedia: jest.fn().mockResolvedValue(true) }));
const mockDeleteUploadedMedia = deleteUploadedMedia as jest.MockedFunction<typeof deleteUploadedMedia>;

describe('Preview image close btn', () => {
  it('should correctly renders and delete image from local and global state', async () => {
    const setImages = jest.fn();
    mockStore.dispatch(addPhotoUrl({ url: 'someUrl', thumbnail: null }));
    await renderWithProviders(
      <PreviewImageCloseBtn
        images={[{ url: 'someUrl', thumbnail: null }]}
        setImages={setImages}
        isDisabled={false}
        image="someUrl"
      />,
      {
        store: mockStore,
      },
    );
    const deleteIcon = screen.getByTestId('deleteIcon');
    await userEvent.press(deleteIcon);
    expect(setImages).toHaveBeenCalled();
    expect(mockStore.getState().activity.media).toEqual([]);
    expect(mockDeleteUploadedMedia).toHaveBeenCalledWith(['someUrl']);
  });
  it('should be disabled, when isDisabled', async () => {
    const setImages = jest.fn();
    await renderWithProviders(
      <PreviewImageCloseBtn
        images={[{ url: 'someUrl', thumbnail: null }]}
        setImages={setImages}
        isDisabled
        image="someUrl"
      />,
      {
        store: mockStore,
      },
    );
    expect(screen.getByTestId('deleteIcon')).toBeDisabled();
  });
  it('should be disabled, when isSavingDisabled', async () => {
    mockStore.dispatch(setSavingDisabled(true));
    const setImages = jest.fn();
    await renderWithProviders(
      <PreviewImageCloseBtn
        images={[{ url: 'someUrl', thumbnail: null }]}
        setImages={setImages}
        isDisabled={false}
        image="someUrl"
      />,
      {
        store: mockStore,
      },
    );
    expect(screen.getByTestId('deleteIcon')).toBeDisabled();
  });
});
