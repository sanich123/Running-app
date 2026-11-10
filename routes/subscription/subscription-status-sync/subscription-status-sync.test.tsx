import { act, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { AppState } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { resetAuthSlice } from '@R/slices/auth/auth';
import { changeNetworkState, NETWORK_INITIAL_STATE } from '@R/slices/network/network';
import { clearSubscriptionSnapshot } from '@R/slices/subscription/subscription';
import { MOCK_SERVER_SUBSCRIPTION } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { setMockUserId, mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import SubscriptionStatusSync from './subscription-status-sync';

describe('subscription status sync', () => {
  let appStateListener: ((state: AppStateStatus) => void) | undefined;
  let removeListener: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(resetAuthSlice());
    mockStore.dispatch(clearSubscriptionSnapshot());
    mockStore.dispatch(changeNetworkState(NETWORK_INITIAL_STATE.networkState));
    appStateListener = undefined;
    removeListener = jest.fn();
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((
      _event: string,
      listener: (state: AppStateStatus) => void,
    ) => {
      appStateListener = listener;
      return { remove: removeListener };
    }) as typeof AppState.addEventListener);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockStore.dispatch(resetAuthSlice());
    mockStore.dispatch(clearSubscriptionSnapshot());
    mockStore.dispatch(changeNetworkState(NETWORK_INITIAL_STATE.networkState));
  });

  it('skips the server query without an authenticated user', async () => {
    const requests: string[] = [];
    server.use(
      http.get(`${BASE_URL}/subscription/me`, ({ request }) => {
        requests.push(request.url);
        return HttpResponse.json(MOCK_SERVER_SUBSCRIPTION);
      }),
    );
    const { unmount } = await renderWithProviders(<SubscriptionStatusSync />);

    expect(requests).toEqual([]);
    expect(mockStore.getState().subscription.isPremium).toBe(false);
    appStateListener?.('active');
    expect(removeListener).not.toHaveBeenCalled();
    await unmount();
    expect(removeListener).toHaveBeenCalled();
  });

  it('persists successful status and refreshes on reconnection and foreground activation', async () => {
    let requestCount = 0;
    server.use(
      http.get(`${BASE_URL}/subscription/me`, () => {
        requestCount += 1;
        return HttpResponse.json(MOCK_SERVER_SUBSCRIPTION);
      }),
    );
    mockStore.dispatch(setMockUserId('user-123'));
    const { unmount } = await renderWithProviders(<SubscriptionStatusSync />);

    await waitFor(() => expect(mockStore.getState().subscription).toMatchObject(MOCK_SERVER_SUBSCRIPTION));
    expect(requestCount).toBe(1);

    await act(async () => {
      mockStore.dispatch(
        changeNetworkState({
          ...NETWORK_INITIAL_STATE.networkState,
          isConnected: true,
          isInternetReachable: null,
        }),
      );
    });
    await waitFor(() => expect(requestCount).toBe(2));

    appStateListener?.('background');
    expect(requestCount).toBe(2);
    appStateListener?.('active');
    await waitFor(() => expect(requestCount).toBe(3));

    await unmount();
    expect(removeListener).toHaveBeenCalled();
  });
});
