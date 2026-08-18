import { screen, userEvent } from '@testing-library/react-native';
import { setUserId } from '@R/slices/auth/auth';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import PreviewUploadableImage from './preview-uploadable-image';

jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: jest.fn(),
  }),
}));
jest.mock('@U/file-sending', () => ({
  compressAndSendFile: jest.fn(() =>
    Promise.resolve({ url: 'https://images.example.test/activity.jpg', thumbnail: 'thumbnail.jpg' }),
  ),
}));
describe('Preview uploadable image', () => {
  it('should correctly renders', async () => {
    mockStore.dispatch(setUserId('someUserId'));
    await renderWithProviders(<PreviewUploadableImage image="someUrl" index={1} isDisabled={false} />, {
      store: mockStore,
    });
    expect(screen.getByText(new RegExp(/Add to activity/i))).toBeOnTheScreen();
  });
  it('should correctly handle isDisabled state', async () => {
    mockStore.dispatch(setUserId('someUserId'));
    await renderWithProviders(<PreviewUploadableImage image="someUrl" index={1} isDisabled />, {
      store: mockStore,
    });
    expect(screen.getByTestId('previewUploadable')).toBeDisabled();
  });

  it('uploads and adds the selected image to the activity', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setUserId('someUserId'));
    await renderWithProviders(<PreviewUploadableImage image="file://activity.jpg" index={0} isDisabled={false} />);
    await user.press(screen.getByTestId('previewUploadable'));
    expect(mockStore.getState().activity.photoVideoUrls[0]).toEqual({
      url: 'https://images.example.test/activity.jpg',
      thumbnail: 'thumbnail.jpg',
    });
  });
});
