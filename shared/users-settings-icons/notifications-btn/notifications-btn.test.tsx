import { fireEvent, screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ROUTES } from '@const/enums';
import { BASE_URL } from '@T/utils/handlers';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import NotificationsBtn from './notifications-btn';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useIsFocused: () => true,
}));

describe('NotificationsBtn', () => {
  it('shows the unread count and opens the notifications route', async () => {
    server.use(http.get(`${BASE_URL}/notification/unread-count`, () => HttpResponse.json({ count: 2 })));
    await renderWithProviders(<NotificationsBtn />);

    expect(await screen.findByText('2')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('notificationsIcon'), { nativeEvent: { locationX: null, locationY: null } });

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.notifications}`);
  });
});
