import { screen, userEvent } from '@testing-library/react-native';
import { TEST_URLS } from '@T/mocks/const';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { uploadActivityMedia } from '../utils';
import PreviewUploadableImage from './preview-uploadable-image';

jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: jest.fn(),
  }),
}));
jest.mock('../utils', () => {
  const { TEST_URLS } = jest.requireActual<{ TEST_URLS: { activityPhoto: string } }>('@T/mocks/const');
  return {
    uploadActivityMedia: jest.fn(() => Promise.resolve({ url: TEST_URLS.activityPhoto, thumbnail: 'thumbnail.jpg' })),
  };
});
describe('Preview uploadable image', () => {
  it('should correctly renders', async () => {
    mockStore.dispatch(setMockUserId('someUserId'));
    await renderWithProviders(<PreviewUploadableImage image="someUrl" index={1} isDisabled={false} />, {
      store: mockStore,
    });
    expect(screen.getByText(new RegExp(/Add to activity/i))).toBeOnTheScreen();
  });
  it('should correctly handle isDisabled state', async () => {
    mockStore.dispatch(setMockUserId('someUserId'));
    await renderWithProviders(<PreviewUploadableImage image="someUrl" index={1} isDisabled />, {
      store: mockStore,
    });
    expect(screen.getByTestId('previewUploadable')).toBeDisabled();
  });

  it('uploads and adds the selected image to the activity', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setMockUserId('someUserId'));
    await renderWithProviders(
      <PreviewUploadableImage image={TEST_URLS.activityPhotoFileUri} index={0} isDisabled={false} />,
    );
    await user.press(screen.getByTestId('previewUploadable'));
    expect(uploadActivityMedia).toHaveBeenCalledWith(TEST_URLS.activityPhotoFileUri);
    expect(mockStore.getState().activity.media[0]).toEqual({
      url: TEST_URLS.activityPhoto,
      thumbnail: 'thumbnail.jpg',
    });
  });
});
