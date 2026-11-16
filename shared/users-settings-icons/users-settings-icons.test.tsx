import { act, fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { AppState, Platform } from 'react-native';
import { ACTIVITY_SAVE_BTN } from '@const/activity-save-btn';
import { ROUTES } from '@const/enums';
import { BASE_URL } from '@T/utils/handlers';
import { server } from '@T/utils/server';
import { mockStore, setMockUserId } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
import { NOTIFICATIONS_OVERFLOW_LABEL } from './notifications-btn/const';
import UsersSettingsIcons from './users-settings-icons';
const mockPush = jest.fn();
let mockAppStateListener: ((state: 'active') => void) | undefined;
let mockIsFocused = true;
let mockPathname = `/${ROUTES.home}/${ROUTES.activity}/someActivityId`;
let mockParams = { userId: 'someUserId', id: 'someActivityId' };
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useIsFocused: () => mockIsFocused,
  usePathname: () => mockPathname,
  useGlobalSearchParams: () => mockParams,
}));
describe('User settings icons', () => {
  beforeEach(() => {
    mockIsFocused = true;
    mockAppStateListener = undefined;
    mockPush.mockClear();
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
      mockAppStateListener = listener as (state: 'active') => void;
      return { remove: jest.fn() };
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('renders the regular header icons on an owned activity', async () => {
    mockPathname = `/${ROUTES.home}/${ROUTES.activity}/someActivityId`;
    mockParams = { userId: 'someUserId', id: 'someActivityId' };
    mockStore.dispatch(setMockUserId('someUserId'));
    await renderWithProviders(<UsersSettingsIcons />, { store: mockStore });
    expect(screen.getByTestId('usersIcon')).toBeOnTheScreen();
    expect(screen.getByTestId('settingsIcon')).toBeOnTheScreen();
    expect(screen.queryByText(ACTIVITY_SAVE_BTN.russian.edit)).not.toBeOnTheScreen();
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

    expect(screen.getAllByTestId(/Icon$/).map((icon) => icon.props.testID)).toEqual([
      'createActivityIcon',
      'usersIcon',
      'settingsIcon',
      'notificationsIcon',
    ]);
    expect(await screen.findByText('3')).toBeOnTheScreen();
    await user.press(screen.getByTestId('notificationsIcon'));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.notifications}`);
  });

  it('shows a compact 99+ badge when the unread count exceeds 99', async () => {
    server.use(http.get(`${BASE_URL}/notification/unread-count`, () => HttpResponse.json({ count: 150 })));
    mockPathname = `/${ROUTES.home}`;
    mockParams = { userId: 'anotherUserId', id: '' };

    await renderWithProviders(<UsersSettingsIcons showCreateActivity />);

    expect(await screen.findByText(NOTIFICATIONS_OVERFLOW_LABEL)).toBeOnTheScreen();
    expect(screen.getByTestId('notificationsBadge')).toHaveStyle({ height: 16 });
  });

  it('opens notifications when the circular button press has no coordinates', async () => {
    mockPathname = `/${ROUTES.home}`;
    mockParams = { userId: 'anotherUserId', id: '' };
    await renderWithProviders(<UsersSettingsIcons showCreateActivity />);

    fireEvent.press(screen.getByTestId('notificationsIcon'), {
      nativeEvent: { locationX: null, locationY: null },
    });

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.notifications}`);
  });

  it('stops polling the unread badge while the home page is not focused', async () => {
    let requestCount = 0;
    server.use(
      http.get(`${BASE_URL}/notification/unread-count`, () => {
        requestCount += 1;
        return HttpResponse.json({ count: 3 });
      }),
    );
    mockIsFocused = false;
    mockPathname = `/${ROUTES.home}`;
    mockParams = { userId: 'anotherUserId', id: '' };

    await renderWithProviders(<UsersSettingsIcons showCreateActivity />);

    await waitFor(() => expect(requestCount).toBe(1));
    await act(async () => {
      await jest.advanceTimersByTimeAsync(60_000);
    });
    expect(requestCount).toBe(1);
  });

  it('refreshes the unread count when the home page or app returns to the foreground', async () => {
    let requestCount = 0;
    server.use(
      http.get(`${BASE_URL}/notification/unread-count`, () => {
        requestCount += 1;
        return HttpResponse.json({ count: 3 });
      }),
    );
    mockPathname = '/' + ROUTES.home;
    mockParams = { userId: 'anotherUserId', id: '' };
    mockIsFocused = false;

    const { rerender, unmount } = await renderWithProviders(<UsersSettingsIcons showCreateActivity />);

    await waitFor(() => expect(requestCount).toBe(1));
    await act(async () => {
      mockIsFocused = true;
      rerender(<UsersSettingsIcons showCreateActivity />);
    });
    await waitFor(() => expect(requestCount).toBe(2));

    await act(async () => {
      mockAppStateListener?.('active');
    });
    await waitFor(() => expect(requestCount).toBe(3));

    unmount();
  });

  it('hides the users action when the users page is already open', async () => {
    mockPathname = `/${ROUTES.users}`;
    mockParams = { userId: 'anotherUserId', id: '' };
    await renderWithProviders(<UsersSettingsIcons />);

    expect(screen.queryByTestId('usersIcon')).not.toBeOnTheScreen();
    expect(mockPush).not.toHaveBeenCalled();
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
