import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen } from '@testing-library/react-native';
import PreviewUploadableImage from './preview-uploadable-image';
import { setUserId } from '@R/slices/auth/auth';

jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: jest.fn(),
  }),
}));
jest.mock('expo-image', () => {
  const actualExpoImage = jest.requireActual('expo-image');
  const { Image } = jest.requireActual('react-native');

  return { ...actualExpoImage, Image };
});
describe('Preview uploadable image', () => {
  it('should correctly renders', () => {
    mockStore.dispatch(setUserId('someUserId'));
    renderWithProviders(<PreviewUploadableImage image="someUrl" index={1} isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(new RegExp(/Add to activity/i))).toBeOnTheScreen();
  });
  it('should correctly handle isDisabled state', () => {
    mockStore.dispatch(setUserId('someUserId'));
    renderWithProviders(<PreviewUploadableImage image="someUrl" index={1} isDisabled />, {
      store: mockStore,
    });
    expect(screen.getByTestId('previewUploadable')).toBeDisabled();
  });
});
