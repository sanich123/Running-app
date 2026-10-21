import { act, waitFor } from '@testing-library/react-native';
import { Tags } from '@R/runich-api/const';
import { renderWithProviders } from '@T/utils/test-utils';
import NotificationRuntime from './notification-runtime';

let mockLastResponse: unknown = null;
let mockResponseHandler: ((response: never) => void) | undefined;
let mockReceivedHandler: (() => void) | undefined;

jest.mock('expo-router', () => ({ __esModule: true, router: { push: jest.fn() } }));
jest.mock('@R/services/activity/activity', () => ({
  activityApi: {
    util: { invalidateTags: jest.fn((tags: unknown[]) => ({ type: 'activity/invalidate', payload: tags })) },
  },
}));
jest.mock('@R/services/comments/comments', () => ({
  commentsApi: {
    util: { invalidateTags: jest.fn((tags: unknown[]) => ({ type: 'comments/invalidate', payload: tags })) },
  },
}));
jest.mock('@R/services/likes/likes', () => ({
  likesApi: {
    util: { invalidateTags: jest.fn((tags: unknown[]) => ({ type: 'likes/invalidate', payload: tags })) },
  },
}));
jest.mock('expo-notifications', () => ({
  __esModule: true,
  setNotificationHandler: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  getLastNotificationResponse: jest.fn(),
  clearLastNotificationResponse: jest.fn(),
}));
jest.mock('@R/services/notifications/notifications', () => ({
  notificationsApi: {
    endpoints: { markNotificationRead: { initiate: jest.fn() } },
    util: { invalidateTags: jest.fn() },
  },
}));

const mockRouterPush = (jest.requireMock('expo-router') as { router: { push: jest.Mock } }).router.push;
const activityInvalidate = (
  jest.requireMock('@R/services/activity/activity') as { activityApi: { util: { invalidateTags: jest.Mock } } }
).activityApi.util.invalidateTags;
const commentsInvalidate = (
  jest.requireMock('@R/services/comments/comments') as { commentsApi: { util: { invalidateTags: jest.Mock } } }
).commentsApi.util.invalidateTags;
const likesInvalidate = (
  jest.requireMock('@R/services/likes/likes') as { likesApi: { util: { invalidateTags: jest.Mock } } }
).likesApi.util.invalidateTags;
const notificationMocks = jest.requireMock('expo-notifications') as {
  setNotificationHandler: jest.Mock;
  addNotificationResponseReceivedListener: jest.Mock;
  addNotificationReceivedListener: jest.Mock;
  getLastNotificationResponse: jest.Mock;
  clearLastNotificationResponse: jest.Mock;
};
const apiMocks = (
  jest.requireMock('@R/services/notifications/notifications') as {
    notificationsApi: {
      endpoints: { markNotificationRead: { initiate: jest.Mock } };
      util: { invalidateTags: jest.Mock };
    };
  }
).notificationsApi;
const mockMarkRead = apiMocks.endpoints.markNotificationRead.initiate;
const mockInvalidate = apiMocks.util.invalidateTags;
const mockResponseSubscriptionRemove = jest.fn();
const mockReceivedSubscriptionRemove = jest.fn();

describe('NotificationRuntime', () => {
  beforeEach(() => {
    mockRouterPush.mockReset();
    activityInvalidate.mockClear();
    commentsInvalidate.mockClear();
    likesInvalidate.mockClear();
    mockResponseSubscriptionRemove.mockReset();
    mockReceivedSubscriptionRemove.mockReset();
    mockMarkRead.mockReset().mockImplementation((id: string) => ({ type: 'notifications/markRead', payload: id }));
    mockInvalidate
      .mockReset()
      .mockImplementation((tags: unknown[]) => ({ type: 'notifications/invalidate', payload: tags }));
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
    mockLastResponse = {
      notification: {
        request: {
          identifier: 'response-1',
          content: { data: { notificationId: 'notification-1', targetType: 'activity', targetId: 'activity-1' } },
        },
      },
    };
    const { unmount } = await renderWithProviders(<NotificationRuntime />);

    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith('/activity/activity-1'));
    expect(mockMarkRead).toHaveBeenCalledWith('notification-1');
    expect(activityInvalidate).toHaveBeenCalledWith([{ type: Tags.activities, id: 'activity-1' }]);
    expect(commentsInvalidate).toHaveBeenCalledWith([
      { type: Tags.comments, id: 'activity-1' },
      { type: Tags.commentCounts, id: 'activity-1' },
    ]);
    expect(likesInvalidate).toHaveBeenCalledWith([{ type: Tags.likes, id: 'activity-1' }]);
    expect(activityInvalidate.mock.invocationCallOrder[0]).toBeLessThan(mockRouterPush.mock.invocationCallOrder[0]);
    expect(commentsInvalidate.mock.invocationCallOrder[0]).toBeLessThan(mockRouterPush.mock.invocationCallOrder[0]);
    expect(likesInvalidate.mock.invocationCallOrder[0]).toBeLessThan(mockRouterPush.mock.invocationCallOrder[0]);
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
    mockReceivedHandler?.();
    expect(mockInvalidate).toHaveBeenCalled();
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
    expect(mockMarkRead).not.toHaveBeenCalled();
    expect(notificationMocks.clearLastNotificationResponse).toHaveBeenCalledTimes(1);
  });
});
