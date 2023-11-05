import { screen } from '@testing-library/react-native';

import UploadPhotosBtn from './upload-photos-btn';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: jest.fn(),
  }),
}));
describe('Upload photos btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(<UploadPhotosBtn />, { store: mockStore });
    expect(screen.getByText('Upload an image')).toBeOnTheScreen();
  });
});
