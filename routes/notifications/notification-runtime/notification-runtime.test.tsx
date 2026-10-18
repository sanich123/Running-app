import { act, waitFor } from '@testing-library/react-native';
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
  getLastNotificationResponseAsync: jest.fn(),
  clearLastNotificationResponseAsync: jest.fn(),
}));
jest.mock('@R/services/notifications/notifications', () => ({
  notificationsApi: {
    endpoints: { markNotificationRead: { initiate: jest.fn() } },
    util: { invalidateTags: jest.fn() },
  },
}));

const mockRouterPush = (jest.requireMock('expo-router') as { router: { push: jest.Mock } }).router.push;
const notificationMocks = jest.requireMock('expo-notifications') as {
  setNotificationHandler: jest.Mock;
  addNotificationResponseReceivedListener: jest.Mock;
  addNotificationReceivedListener: jest.Mock;
  getLastNotificationResponseAsync: jest.Mock;
  clearLastNotificationResponseAsync: jest.Mock;
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
    mockResponseSubscriptionRemove.mockReset();
    mockReceivedSubscriptionRemove.mockReset();
    mockMarkRead.mockReset().mockImplementation((id: string) => ({ type: 'notifications/markRead', payload: id }));
    mockInvalidate
      .mockReset()
      .mockImplementation((tags: unknown[]) => ({ type: 'notifications/invalidate', payload: tags }));
    notificationMocks.setNotificationHandler.mockReset();
    notificationMocks.clearLastNotificationResponseAsync.mockReset().mockResolvedValue(undefined);
    notificationMocks.addNotificationResponseReceivedListener.mockReset().mockImplementation((handler) => {
      mockResponseHandler = handler;
      return { remove: mockResponseSubscriptionRemove };
    });
    notificationMocks.addNotificationReceivedListener.mockReset().mockImplementation((handler) => {
      mockReceivedHandler = handler;
      return { remove: mockReceivedSubscriptionRemove };
    });
    notificationMocks.getLastNotificationResponseAsync.mockImplementation(() => Promise.resolve(mockLastResponse));
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
    expect(notificationMocks.clearLastNotificationResponseAsync).toHaveBeenCalledTimes(1);
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
    expect(notificationMocks.clearLastNotificationResponseAsync).toHaveBeenCalledTimes(1);
  });
});
