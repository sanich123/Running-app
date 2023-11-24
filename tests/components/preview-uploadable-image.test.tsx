import { screen } from '@testing-library/react-native';

import PreviewUploadableImage from '../../components/preview-uploadable-image/preview-uploadable-image';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';
jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: jest.fn(),
  }),
}));
describe('Preview uploadable image', () => {
  it('should correctly renders', () => {
    renderWithProviders(<PreviewUploadableImage image="someUrl" index={1} isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(new RegExp(/Add to activity/i))).toBeOnTheScreen();
  });
  it('should correctly handle isDisabled state', () => {
    renderWithProviders(<PreviewUploadableImage image="someUrl" index={1} isDisabled />, {
      store: mockStore,
    });
    expect(screen.getByTestId('previewUploadable')).toBeDisabled();
  });
});
