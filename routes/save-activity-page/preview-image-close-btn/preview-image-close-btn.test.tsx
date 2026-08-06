import { screen, userEvent } from '@testing-library/react-native';
import { addPhotoUrl } from '@R/slices/actitivity-additional-info/activity-additional-info';
import { setIsDisableWhileSending } from '@R/slices/activity/activity';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import PreviewImageCloseBtn from './preview-image-close-btn';

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
    expect(mockStore.getState().additionalInfoActivity.photoVideoUrls).toEqual([]);
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
  it('should be disabled, when isDisabledWhileSending', async () => {
    mockStore.dispatch(setIsDisableWhileSending(true));
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
