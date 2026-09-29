import { act, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { resetAuthSlice } from '@R/slices/auth/auth';
import { changeNetworkState, NETWORK_INITIAL_STATE } from '@R/slices/network/network';
import { clearSubscriptionSnapshot } from '@R/slices/subscription/subscription';
import { setMockUserId, mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import SubscriptionStatusSync from './subscription-status-sync';
import type { CurrentSubscriptionResponse } from '@R/services/subscription/types';

const mockUseSubscriptionQuery = jest.fn();
jest.mock('@R/services/subscription/subscription', () => ({
  useGetCurrentSubscriptionQuery: (...args: unknown[]) => mockUseSubscriptionQuery(...args),
}));

const subscription: CurrentSubscriptionResponse = {
  userId: 'user-123',
  isPremium: true,
  status: 'active',
  provider: null,
  productId: null,
  startsAt: '2026-01-01T00:00:00.000Z',
  expiresAt: '2027-01-01T00:00:00.000Z',
  cancelAtPeriodEnd: false,
};

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
    mockUseSubscriptionQuery.mockReturnValue({ data: undefined, isSuccess: false, refetch: jest.fn() });
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
    const { unmount } = await renderWithProviders(<SubscriptionStatusSync />);

    expect(mockUseSubscriptionQuery).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ skip: true, refetchOnMountOrArgChange: true, refetchOnReconnect: true }),
    );
    expect(mockStore.getState().subscription.isPremium).toBe(false);
    appStateListener?.('active');
    expect(removeListener).not.toHaveBeenCalled();
    await unmount();
    expect(removeListener).toHaveBeenCalled();
  });

  it('persists successful status and refreshes on reconnection and foreground activation', async () => {
    mockStore.dispatch(setMockUserId('user-123'));
    const refetch = jest.fn();
    mockUseSubscriptionQuery.mockReturnValue({ data: subscription, isSuccess: true, refetch });
    const { unmount } = await renderWithProviders(<SubscriptionStatusSync />);

    await waitFor(() => expect(mockStore.getState().subscription).toMatchObject(subscription));
    expect(mockUseSubscriptionQuery).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ skip: false, refetchOnMountOrArgChange: true, refetchOnReconnect: true }),
    );

    await act(async () => {
      mockStore.dispatch(
        changeNetworkState({
          ...NETWORK_INITIAL_STATE.networkState,
          isConnected: true,
          isInternetReachable: null,
        }),
      );
    });
    expect(refetch).toHaveBeenCalledTimes(1);

    appStateListener?.('background');
    expect(refetch).toHaveBeenCalledTimes(1);
    appStateListener?.('active');
    expect(refetch).toHaveBeenCalledTimes(2);

    await unmount();
    expect(removeListener).toHaveBeenCalled();
  });
});
