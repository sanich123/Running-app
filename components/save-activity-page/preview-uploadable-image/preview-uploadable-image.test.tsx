import { USER_AUTH_MOCKS } from '@T/mocks/use-auth';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen } from '@testing-library/react-native';

import PreviewUploadableImage from './preview-uploadable-image';
import * as auth from '../../../auth/context/auth-context';

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
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<PreviewUploadableImage image="someUrl" index={1} isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(new RegExp(/Add to activity/i))).toBeOnTheScreen();
  });
  it('should correctly handle isDisabled state', () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<PreviewUploadableImage image="someUrl" index={1} isDisabled />, {
      store: mockStore,
    });
    expect(screen.getByTestId('previewUploadable')).toBeDisabled();
  });
});
