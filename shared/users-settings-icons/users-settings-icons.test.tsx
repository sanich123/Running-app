import { screen, userEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { ACTIVITY_SAVE_BTN } from '@const/activity-save-btn';
import { ROUTES } from '@const/enums';
import UsersSettingsIcons from './users-settings-icons';
import { mockStore, setMockUserId } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
const mockPush = jest.fn();
const mockUnreadCount = 3;
let mockIsFocused = true;
let mockUnreadQueryOptions: Record<string, unknown> | undefined;
let mockPathname = `/${ROUTES.home}/${ROUTES.activity}/someActivityId`;
let mockParams = { userId: 'someUserId', id: 'someActivityId' };
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useIsFocused: () => mockIsFocused,
  usePathname: () => mockPathname,
  useGlobalSearchParams: () => mockParams,
}));
jest.mock('@R/services/notifications/notifications', () => ({
  useGetUnreadNotificationCountQuery: (_arg: unknown, options: Record<string, unknown>) => {
    mockUnreadQueryOptions = options;
    return { data: mockUnreadCount };
  },
}));
describe('User settings icons', () => {
  beforeEach(() => {
    mockIsFocused = true;
    mockUnreadQueryOptions = undefined;
    mockPush.mockClear();
  });

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

  it('shows the unread badge and opens the notification center from the home header', async () => {
    const user = userEvent.setup();
    mockPathname = `/${ROUTES.home}`;
    mockParams = { userId: 'anotherUserId', id: '' };
    await renderWithProviders(<UsersSettingsIcons showCreateActivity />);

    expect(mockUnreadQueryOptions).toMatchObject({ pollingInterval: 60_000, skipPollingIfUnfocused: true });
    expect(screen.getAllByTestId(/Icon$/).map((icon) => icon.props.testID)).toEqual([
      'createActivityIcon',
      'usersIcon',
      'settingsIcon',
      'notificationsIcon',
    ]);
    expect(screen.getByTestId('notificationsBadge')).toHaveTextContent('3');
    await user.press(screen.getByTestId('notificationsIcon'));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.notifications}`);
  });

  it('stops polling the unread badge while the home page is not focused', async () => {
    mockIsFocused = false;
    mockPathname = `/${ROUTES.home}`;
    mockParams = { userId: 'anotherUserId', id: '' };

    await renderWithProviders(<UsersSettingsIcons showCreateActivity />);

    expect(mockUnreadQueryOptions).toMatchObject({ pollingInterval: 0, skipPollingIfUnfocused: true });
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
