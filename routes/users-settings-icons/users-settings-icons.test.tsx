import { screen, userEvent } from '@testing-library/react-native';
import { setUserId } from '@R/slices/auth/auth';
import { ACTIVITY_SAVE_BTN } from '@Routes/activity/save-btn/const';
import UsersSettingsIcons from './users-settings-icons';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
const mockPush = jest.fn();
let mockPathname = '/home/activity/someActivityId';
let mockParams = { userId: 'someUserId', id: 'someActivityId' };
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
  useGlobalSearchParams: () => mockParams,
}));
describe('User settings icons', () => {
  it('should correctly renders edit btn, when userId === user?.id', async () => {
    mockPathname = '/home/activity/someActivityId';
    mockParams = { userId: 'someUserId', id: 'someActivityId' };
    mockStore.dispatch(setUserId('someUserId'));
    await renderWithProviders(<UsersSettingsIcons />, { store: mockStore });
    expect(await screen.findByText(ACTIVITY_SAVE_BTN.russian.edit)).toBeOnTheScreen();
  });

  it('opens users and settings from the header icons', async () => {
    const user = userEvent.setup();
    mockPathname = '/home';
    mockParams = { userId: 'anotherUserId', id: '' };
    mockStore.dispatch(setUserId('someUserId'));
    await renderWithProviders(<UsersSettingsIcons />);
    await user.press(screen.getByTestId('usersIcon'));
    await user.press(screen.getByTestId('settingsIcon'));
    expect(mockPush).toHaveBeenNthCalledWith(1, '/(protected)/users');
    expect(mockPush).toHaveBeenNthCalledWith(2, '/(protected)/settings');
  });
});
