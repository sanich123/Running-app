import { fireEvent, screen } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import NotificationsBtn from './notifications-btn';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useIsFocused: () => true,
}));
jest.mock('@R/services/notifications/notifications', () => ({
  notificationsApi: {
    endpoints: {
      getNotifications: { initiate: () => ({ type: 'test/getNotificationsInitiated' }) },
      getUnreadNotificationCount: { initiate: () => ({ type: 'test/getUnreadNotificationCountInitiated' }) },
    },
  },
  useGetUnreadNotificationCountQuery: () => ({ data: 2, refetch: jest.fn() }),
}));

describe('NotificationsBtn', () => {
  it('shows the unread count and opens the notifications route', async () => {
    await renderWithProviders(<NotificationsBtn />);

    expect(screen.getByTestId('notificationsBadge')).toHaveTextContent('2');
    fireEvent.press(screen.getByTestId('notificationsIcon'), { nativeEvent: { locationX: null, locationY: null } });

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.notifications}`);
  });
});
