import { addPhotoUrl, setIsDisableWhileSending } from '@R/activity/activity';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen, userEvent } from '@testing-library/react-native';

import PreviewImageCloseBtn from './preview-image-close-btn';

describe('Preview image close btn', () => {
  it('should correctly renders and delete image from local and global state', async () => {
    const setImages = jest.fn();
    mockStore.dispatch(addPhotoUrl({ url: 'someUrl', thumbnail: null }));
    renderWithProviders(
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
    expect(mockStore.getState().activity.additionalInfo.photoVideoUrls).toEqual([]);
  });
  it('should be disabled, when isDisabled', () => {
    const setImages = jest.fn();
    renderWithProviders(
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
  it('should be disabled, when isDisabledWhileSending', () => {
    mockStore.dispatch(setIsDisableWhileSending(true));
    const setImages = jest.fn();
    renderWithProviders(
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
