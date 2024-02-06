import { USER_AUTH_MOCKS } from '@T/mocks/use-auth';
import { screen } from '@testing-library/react-native';

import PreviewUploadableImage from './preview-uploadable-image';
import * as auth from '../../auth/context/auth-context';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: jest.fn(),
  }),
}));

jest.mock('@A/supabase/supabase-init', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    },
  },
}));
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
