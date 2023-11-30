import * as auth from '@A/context/auth-context';
import { setIsDisabledWhileSendingProfile } from '@R/profile/profile';
import { USER_AUTH_MOCKS } from '@T/mocks/use-auth';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen } from '@testing-library/react-native';

import AvatarIconEditable from './avatar-editable';
import { AvatarEditableTestIds } from './const';

jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: jest.fn(),
  }),
}));
describe('Avatar icon editable', () => {
  it('should correctly renders', () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />, { store: mockStore });
    expect(screen.getByTestId(AvatarEditableTestIds.editBtn)).toBeOnTheScreen();
  });
  it('should renders an image', () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />, { store: mockStore });
    const img = screen.getByTestId(AvatarEditableTestIds.successImg);
    expect(img).toBeOnTheScreen();
  });
  it('should be disabled, when isDisabled', () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled />, { store: mockStore });
    expect(screen.getByTestId(AvatarEditableTestIds.editBtn)).toBeDisabled();
  });
  it('should be disabled, when isDisabledWhileSendingProfile', () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    mockStore.dispatch(setIsDisabledWhileSendingProfile(true));
    renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />, { store: mockStore });
    expect(screen.getByTestId(AvatarEditableTestIds.editBtn)).toBeDisabled();
  });
});
