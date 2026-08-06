import { screen } from '@testing-library/react-native';
import { setUserId } from '@R/slices/auth/auth';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import PreviewUploadableImage from './preview-uploadable-image';

jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: jest.fn(),
  }),
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
});
