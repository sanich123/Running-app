import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES, ROUTES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { changeLanguage } from '@R/slices/settings/settings';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import NotificationsPage from './notifications-page';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));
const mockErrorToast = (jest.requireMock('@S/error-toast/error-toast') as { errorToast: jest.Mock }).errorToast;

describe('NotificationsPage', () => {
  beforeEach(() => {
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setMockUserId('notification-owner'));
    mockPush.mockReset();
  });

  it('lists unread notifications, marks a tapped item as read, and opens its activity', async () => {
    let readRequest = false;
    server.use(
      http.get(`${BASE_URL}/notification`, () =>
        HttpResponse.json({
          notifications: [
            {
              id: 'notification-1',
              type: 'activity-like',
              targetType: 'activity',
              targetId: 'activity-1',
              relatedId: null,
              actorName: 'Alice',
              actorSurname: 'Runner',
              actorProfilePhoto: null,
              content: null,
              createdAt: new Date().toISOString(),
              readAt: null,
            },
          ],
          hasMore: false,
          nextCursor: null,
        }),
      ),
      http.get(`${BASE_URL}/notification/unread-count`, () => HttpResponse.json(1)),
      http.patch(`${BASE_URL}/notification/notification-1/read`, () => {
        readRequest = true;
        return HttpResponse.json({ updated: 1 });
      }),
    );

    await renderWithProviders(<NotificationsPage />);

    expect(await screen.findByText('Alice Runner понравилась ваша тренировка')).toBeOnTheScreen();
    expect(screen.getByTestId('unread-notification-1')).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('notification-notification-1'));

    await waitFor(() => expect(readRequest).toBe(true));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.activity}/activity-1`));
  });

  it('marks all notifications as read', async () => {
    let readAllRequest = false;
    server.use(
      http.get(`${BASE_URL}/notification`, () =>
        HttpResponse.json({ notifications: [], hasMore: false, nextCursor: null }),
      ),
      http.get(`${BASE_URL}/notification/unread-count`, () => HttpResponse.json(2)),
      http.patch(`${BASE_URL}/notification/read-all`, () => {
        readAllRequest = true;
        return HttpResponse.json({ updated: 2 });
      }),
    );

    await renderWithProviders(<NotificationsPage />);
    await waitFor(() =>
      expect(screen.getByTestId('markAllNotificationsReadButton').props.accessibilityState.disabled).toBe(false),
    );
    await fireEvent.press(screen.getByTestId('markAllNotificationsReadButton'));

    await waitFor(() => expect(readAllRequest).toBe(true));
  });

  it('shows an error state and retries the feed request', async () => {
    let requests = 0;
    server.use(
      http.get(`${BASE_URL}/notification`, () => {
        requests += 1;
        return requests === 1
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json({ notifications: [], hasMore: false, nextCursor: null });
      }),
      http.get(`${BASE_URL}/notification/unread-count`, () => HttpResponse.json(0)),
    );

    await renderWithProviders(<NotificationsPage />);
    await screen.findByText('Не удалось загрузить уведомления');
    await fireEvent.press(screen.getByText('Повторить'));
    await screen.findByText('Пока нет уведомлений');
    expect(requests).toBe(2);
    expect(screen.getByTestId('markAllNotificationsReadButton').props.accessibilityState.disabled).toBe(true);
  });

  it('loads the next cursor page and opens notification settings', async () => {
    const requestedCursors: string[] = [];
    const first = {
      id: 'notification-page-1',
      type: 'unknown',
      targetType: 'profile',
      targetId: 'profile-1',
      relatedId: null,
      actorName: null,
      actorSurname: null,
      actorProfilePhoto: 'https://example.com/photo.jpg',
      content: null,
      createdAt: new Date().toISOString(),
      readAt: new Date().toISOString(),
    };
    server.use(
      http.get(`${BASE_URL}/notification`, ({ request }) => {
        const cursor = new URL(request.url).searchParams.get('cursor') ?? '';
        requestedCursors.push(cursor);
        return cursor
          ? HttpResponse.json({
              notifications: [{ ...first, id: 'notification-page-2' }],
              hasMore: false,
              nextCursor: null,
            })
          : HttpResponse.json({ notifications: [first], hasMore: true, nextCursor: 'cursor-1' });
      }),
      http.get(`${BASE_URL}/notification/unread-count`, () => HttpResponse.json(0)),
    );

    await renderWithProviders(<NotificationsPage />);
    await screen.findByText('Новое уведомление');
    await fireEvent.press(screen.getByTestId('notificationSettingsButton'));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.settings}/${ROUTES.notificationSettings}`);
    await fireEvent(screen.getByTestId('notificationsList'), 'onEndReached');
    await screen.findByTestId('notification-notification-page-2');
    expect(requestedCursors).toEqual(['', 'cursor-1']);
  });

  it('handles failed mark-read and mark-all requests while keeping unknown targets in the feed', async () => {
    const feedItem = {
      id: 'notification-other',
      type: 'unknown',
      targetType: 'profile',
      targetId: 'profile-1',
      relatedId: null,
      actorName: null,
      actorSurname: null,
      actorProfilePhoto: null,
      content: 'A note',
      createdAt: new Date().toISOString(),
      readAt: null,
    };
    server.use(
      http.get(`${BASE_URL}/notification`, () =>
        HttpResponse.json({ notifications: [feedItem], hasMore: false, nextCursor: null }),
      ),
      http.get(`${BASE_URL}/notification/unread-count`, () => HttpResponse.json(1)),
      http.patch(`${BASE_URL}/notification/notification-other/read`, () => new HttpResponse(null, { status: 500 })),
      http.patch(`${BASE_URL}/notification/read-all`, () => new HttpResponse(null, { status: 500 })),
    );

    await renderWithProviders(<NotificationsPage />);
    await screen.findByText('A note');
    await fireEvent.press(screen.getByTestId('notification-notification-other'));
    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith('Не удалось отметить уведомление прочитанным', expect.anything()),
    );
    await fireEvent.press(screen.getByTestId('markAllNotificationsReadButton'));
    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith('Не удалось прочитать уведомления', expect.anything()),
    );
    expect(mockPush).not.toHaveBeenCalled();
  });
});
