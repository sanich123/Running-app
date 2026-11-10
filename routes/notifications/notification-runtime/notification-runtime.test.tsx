import { act, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { useGetActivityByActivityIdQuery } from '@R/services/activity/activity';
import { useGetCommentsByActivityIdInfiniteQuery } from '@R/services/comments/comments';
import { useGetLikesByActivityIdInfiniteQuery } from '@R/services/likes/likes';
import { useGetUnreadNotificationCountQuery } from '@R/services/notifications/notifications';
import { MOCK_SERVER_ACTIVITY } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import NotificationRuntime from './notification-runtime';

let mockLastResponse: unknown = null;
let mockResponseHandler: ((response: never) => void) | undefined;
let mockReceivedHandler: (() => void) | undefined;

jest.mock('expo-router', () => ({ __esModule: true, router: { push: jest.fn() } }));
jest.mock('expo-notifications', () => ({
  __esModule: true,
  setNotificationHandler: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  getLastNotificationResponse: jest.fn(),
  clearLastNotificationResponse: jest.fn(),
}));

const mockRouterPush = (jest.requireMock('expo-router') as { router: { push: jest.Mock } }).router.push;
const notificationMocks = jest.requireMock('expo-notifications') as {
  setNotificationHandler: jest.Mock;
  addNotificationResponseReceivedListener: jest.Mock;
  addNotificationReceivedListener: jest.Mock;
  getLastNotificationResponse: jest.Mock;
  clearLastNotificationResponse: jest.Mock;
};
const mockResponseSubscriptionRemove = jest.fn();
const mockReceivedSubscriptionRemove = jest.fn();

function ApiSubscriptions() {
  useGetActivityByActivityIdQuery({ activityId: 'activity-1', viewerId: 'viewer-1' });
  useGetCommentsByActivityIdInfiniteQuery({ activityId: 'activity-1' });
  useGetLikesByActivityIdInfiniteQuery({ activityId: 'activity-1' });
  useGetUnreadNotificationCountQuery();
  return null;
}

describe('NotificationRuntime', () => {
  beforeEach(() => {
    mockRouterPush.mockReset();
    mockResponseSubscriptionRemove.mockReset();
    mockReceivedSubscriptionRemove.mockReset();
    notificationMocks.setNotificationHandler.mockReset();
    notificationMocks.clearLastNotificationResponse.mockReset();
    notificationMocks.addNotificationResponseReceivedListener.mockReset().mockImplementation((handler) => {
      mockResponseHandler = handler;
      return { remove: mockResponseSubscriptionRemove };
    });
    notificationMocks.addNotificationReceivedListener.mockReset().mockImplementation((handler) => {
      mockReceivedHandler = handler;
      return { remove: mockReceivedSubscriptionRemove };
    });
    notificationMocks.getLastNotificationResponse.mockImplementation(() => mockLastResponse);
    mockLastResponse = null;
    mockResponseHandler = undefined;
    mockReceivedHandler = undefined;
  });

  it('routes a tapped activity push, marks it read, invalidates on received push, and removes listeners', async () => {
    let activityRequests = 0;
    let commentRequests = 0;
    let likeRequests = 0;
    let unreadCountRequests = 0;
    const markedNotificationIds: string[] = [];
    server.use(
      http.get(`${BASE_URL}/activity/activityId/activity-1`, () => {
        activityRequests += 1;
        return HttpResponse.json({ ...MOCK_SERVER_ACTIVITY, id: 'activity-1' });
      }),
      http.get(`${BASE_URL}/comment/activity-1`, () => {
        commentRequests += 1;
        return HttpResponse.json({ comments: [], hasMore: false, nextCursor: null });
      }),
      http.get(`${BASE_URL}/like/activity-1`, () => {
        likeRequests += 1;
        return HttpResponse.json({ likes: [], hasMore: false, nextCursor: null, currentUserLike: null });
      }),
      http.get(`${BASE_URL}/notification/unread-count`, () => {
        unreadCountRequests += 1;
        return HttpResponse.json({ count: 2 });
      }),
      http.patch(`${BASE_URL}/notification/notification-1/read`, () => {
        markedNotificationIds.push('notification-1');
        return HttpResponse.json({ updated: 1 });
      }),
    );
    mockStore.dispatch(setMockUserId('viewer-1'));
    mockLastResponse = {
      notification: {
        request: {
          identifier: 'response-1',
          content: { data: { notificationId: 'notification-1', targetType: 'activity', targetId: 'activity-1' } },
        },
      },
    };
    const { unmount } = await renderWithProviders(
      <>
        <ApiSubscriptions />
        <NotificationRuntime />
      </>,
      { store: mockStore },
    );

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/activity/activity-1');
      expect(markedNotificationIds).toEqual(['notification-1']);
      expect(activityRequests).toBeGreaterThanOrEqual(2);
      expect(commentRequests).toBeGreaterThanOrEqual(2);
      expect(likeRequests).toBeGreaterThanOrEqual(2);
    });
    expect(notificationMocks.clearLastNotificationResponse).toHaveBeenCalledTimes(1);
    const handler = notificationMocks.setNotificationHandler.mock.calls[0][0] as {
      handleNotification: () => Promise<unknown>;
    };
    await expect(handler.handleNotification()).resolves.toEqual({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    });

    mockResponseHandler?.(mockLastResponse as never);
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    await act(async () => {
      mockReceivedHandler?.();
    });
    await waitFor(() => {
      expect(unreadCountRequests).toBeGreaterThanOrEqual(2);
    });
    expect(activityRequests).toBeGreaterThanOrEqual(2);
    expect(commentRequests).toBeGreaterThanOrEqual(2);
    expect(likeRequests).toBeGreaterThanOrEqual(2);
    await act(async () => {
      unmount();
    });
    expect(mockResponseSubscriptionRemove).toHaveBeenCalledTimes(1);
    expect(mockReceivedSubscriptionRemove).toHaveBeenCalledTimes(1);
  });

  it('routes unknown push targets to notifications and ignores missing notification ids', async () => {
    mockLastResponse = {
      notification: {
        request: { identifier: 'response-2', content: { data: { targetType: 'comment', targetId: 42 } } },
      },
    };
    await renderWithProviders(<NotificationRuntime />);
    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith('/notifications'));
    expect(notificationMocks.clearLastNotificationResponse).toHaveBeenCalledTimes(1);
  });
});
