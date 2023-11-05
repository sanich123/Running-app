import { screen, userEvent } from '@testing-library/react-native';

import ProfileUpdateBtn from './profile-update-btn';
import * as auth from '../../auth/context/auth-context';
import { USER_AUTH_MOCKS } from '../../tests/mocks/use-auth';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
describe('Profile update btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    expect(screen.getByText('Update')).toBeOnTheScreen();
  });
  it('should correctly interract with the user', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    const updateBtn = screen.getByText('Update');
    expect(mockStore.getState().profile.isDisabledWhileSendingProfile).toEqual(false);
    await userEvent.press(updateBtn);
    expect(mockStore.getState().profile.isDisabledWhileSendingProfile).toEqual(false);
  });
});
