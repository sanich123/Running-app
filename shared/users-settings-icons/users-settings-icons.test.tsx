import { screen, userEvent } from '@testing-library/react-native';
import { ACTIVITY_SAVE_BTN } from '@const/activity-save-btn';
import { ROUTES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import UsersSettingsIcons from './users-settings-icons';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
const mockPush = jest.fn();
let mockPathname = `/${ROUTES.home}/${ROUTES.activity}/someActivityId`;
let mockParams = { userId: 'someUserId', id: 'someActivityId' };
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
  useGlobalSearchParams: () => mockParams,
}));
describe('User settings icons', () => {
  it('should correctly renders edit btn, when userId === user?.id', async () => {
    mockPathname = `/${ROUTES.home}/${ROUTES.activity}/someActivityId`;
    mockParams = { userId: 'someUserId', id: 'someActivityId' };
    mockStore.dispatch(setUserId('someUserId'));
    await renderWithProviders(<UsersSettingsIcons />, { store: mockStore });
    expect(await screen.findByText(ACTIVITY_SAVE_BTN.russian.edit)).toBeOnTheScreen();
  });

  it('opens users and settings from the header icons', async () => {
    const user = userEvent.setup();
    mockPathname = `/${ROUTES.home}`;
    mockParams = { userId: 'anotherUserId', id: '' };
    mockStore.dispatch(setUserId('someUserId'));
    await renderWithProviders(<UsersSettingsIcons />);
    await user.press(screen.getByTestId('usersIcon'));
    await user.press(screen.getByTestId('settingsIcon'));
    expect(mockPush).toHaveBeenNthCalledWith(1, `/${ROUTES.users}`);
    expect(mockPush).toHaveBeenNthCalledWith(2, `/${ROUTES.settings}`);
  });
});
