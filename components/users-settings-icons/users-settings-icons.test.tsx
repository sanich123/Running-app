import { screen } from '@testing-library/react-native';
import { ACTIVITY_SAVE_BTN } from '@C/activity/save-btn/const';
import { setUserId } from '@R/slices/auth/auth';
import UsersSettingsIcons from './users-settings-icons';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/home/activity/someActivityId',
  useGlobalSearchParams: () => ({ userId: 'someUserId', id: 'someActivityId' }),
}));
describe('User settings icons', () => {
  it('should correctly renders edit btn, when userId === user?.id', async () => {
    mockStore.dispatch(setUserId('someUserId'));
    await renderWithProviders(<UsersSettingsIcons />, { store: mockStore });
    expect(await screen.findByText(ACTIVITY_SAVE_BTN.russian.edit)).toBeOnTheScreen();
  });
});
