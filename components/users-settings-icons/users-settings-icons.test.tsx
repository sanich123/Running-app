import UsersSettingsIcons from './users-settings-icons';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
import * as auth from '../../auth/context/auth-context';
import { USER_AUTH_MOCKS } from '@T/mocks/use-auth';
import { screen } from '@testing-library/react-native';
import { ACTIVITY_SAVE_BTN } from '@C/activity/save-btn/const';
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/home/activity/someActivityId',
  useLocalSearchParams: () => ({ userId: 'someUserId', id: 'someActivityId' }),
}));
describe('User settings icons', () => {
  it('should correctly renders edit btn, when userId === user?.id', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<UsersSettingsIcons />, { store: mockStore });
    expect(await screen.findByText(ACTIVITY_SAVE_BTN.russian.edit)).toBeOnTheScreen();
  });
});
