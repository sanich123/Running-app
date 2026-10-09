import { screen, userEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { ACTIVITY_SAVE_BTN } from '@const/activity-save-btn';
import { ROUTES } from '@const/enums';
import UsersSettingsIcons from './users-settings-icons';
import { mockStore, setMockUserId } from '../../tests/utils/mock-store';
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
    mockStore.dispatch(setMockUserId('someUserId'));
    await renderWithProviders(<UsersSettingsIcons />, { store: mockStore });
    expect(await screen.findByText(ACTIVITY_SAVE_BTN.russian.edit)).toBeOnTheScreen();
  });

  it('opens users and settings from the header icons', async () => {
    const user = userEvent.setup();
    mockPathname = `/${ROUTES.home}`;
    mockParams = { userId: 'anotherUserId', id: '' };
    mockStore.dispatch(setMockUserId('someUserId'));
    await renderWithProviders(<UsersSettingsIcons />);
    await user.press(screen.getByTestId('usersIcon'));
    await user.press(screen.getByTestId('settingsIcon'));
    expect(mockPush).toHaveBeenNthCalledWith(1, `/${ROUTES.users}`);
    expect(mockPush).toHaveBeenNthCalledWith(2, `/${ROUTES.settings}`);
  });

  it('opens a new manual activity from the home header', async () => {
    const user = userEvent.setup();
    mockPathname = `/${ROUTES.home}`;
    mockParams = { userId: 'someUserId', id: '' };
    mockStore.dispatch(setMockUserId('someUserId'));
    await renderWithProviders(<UsersSettingsIcons showCreateActivity />);

    await user.press(screen.getByTestId('createActivityIcon'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: `/${ROUTES.manualActivity}`,
      params: expect.objectContaining({
        cameraVisible: 'false',
        manualDistance: '0',
        manualHours: '0',
        manualMinutes: '0',
        manualSeconds: '0',
        mode: 'manual',
        sport: 'run',
        visibility: 'followers',
      }),
    });
  });

  it('does not navigate when the current header route is already open', async () => {
    const user = userEvent.setup();
    mockPathname = `/${ROUTES.users}`;
    mockParams = { userId: 'anotherUserId', id: '' };
    await renderWithProviders(<UsersSettingsIcons />);

    await user.press(screen.getByTestId('usersIcon'));

    expect(mockPush).not.toHaveBeenCalledWith(`/${ROUTES.users}`);
  });

  it('uses compact iOS header icon sizes', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });

    try {
      mockPathname = `/${ROUTES.home}`;
      mockParams = { userId: 'anotherUserId', id: '' };
      await renderWithProviders(<UsersSettingsIcons showCreateActivity />);

      expect(screen.getByTestId('createActivityIcon')).toBeOnTheScreen();
      expect(screen.getByTestId('usersIcon')).toBeOnTheScreen();
      expect(screen.getByTestId('settingsIcon')).toBeOnTheScreen();
    } finally {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
    }
  });

  it('uses the Android header icon sizes', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });

    try {
      mockPathname = `/${ROUTES.home}`;
      mockParams = { userId: 'anotherUserId', id: '' };
      await renderWithProviders(<UsersSettingsIcons showCreateActivity />);

      expect(screen.getByTestId('createActivityIcon')).toBeOnTheScreen();
      expect(screen.getByTestId('usersIcon')).toBeOnTheScreen();
      expect(screen.getByTestId('settingsIcon')).toBeOnTheScreen();
    } finally {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
    }
  });
});
