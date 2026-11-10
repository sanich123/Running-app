import type { PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { resetMockLocation, mockStore } from '@T/utils/mock-store';
import useActivityNavigation from './use-activity-navigation';

describe('useActivityNavigation', () => {
  beforeEach(() => {
    mockStore.dispatch(resetMockLocation());
  });

  it('keeps navigation inactive when no route is selected', async () => {
    const wrapper = ({ children }: PropsWithChildren) => <Provider store={mockStore}>{children}</Provider>;
    const { result } = await renderHook(() => useActivityNavigation(false), { wrapper });

    expect(result.current.contextValue.isNavigationActive).toBe(false);
    expect(result.current.contextValue.isNavigationRouteVisible).toBe(false);

    act(() => {
      result.current.contextValue.onToggleNavigationActive();
      result.current.contextValue.onToggleNavigationRouteVisibility();
    });

    expect(result.current.contextValue.isNavigationActive).toBe(false);
    expect(result.current.contextValue.isNavigationRouteVisible).toBe(false);
  });
});
