import type React from 'react';
import { screen, userEvent } from '@testing-library/react-native';
import type * as ReactNative from 'react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import NavigationControls from './navigation-controls';
import type { ActivityNavigationContextValue } from '../../navigation-context';
import type { ActivityLocation } from '@S/card/types';

const mockPresent = jest.fn();
const mockDismiss = jest.fn();
const mockReadVisibleBounds = jest.fn();
let mockNavigation: ActivityNavigationContextValue | null = null;

jest.mock('@gorhom/bottom-sheet', () => {
  const ReactModule = jest.requireActual('react') as typeof React;
  const { ScrollView, View } = jest.requireActual('react-native') as typeof ReactNative;
  const BottomSheetModal = ReactModule.forwardRef<
    { dismiss: () => void; present: () => void },
    React.PropsWithChildren<object>
  >(({ children }, ref) => {
    ReactModule.useImperativeHandle(ref, () => ({ dismiss: mockDismiss, present: mockPresent }));
    return ReactModule.createElement(View, null, children);
  });
  return {
    BottomSheetBackdrop: () => null,
    BottomSheetModal,
    BottomSheetModalProvider: ({ children }: React.PropsWithChildren) =>
      ReactModule.createElement(ReactModule.Fragment, null, children),
    BottomSheetScrollView: ScrollView,
  };
});

jest.mock('../../navigation-context', () => ({
  useActivityNavigationContext: () => mockNavigation,
}));

jest.mock('../activity-map-context', () => ({
  useActivityMapContext: () => ({ readVisibleBounds: mockReadVisibleBounds }),
}));

jest.mock('@Routes/activity/navigation-settings/navigation-settings-panel/navigation-settings-panel', () => ({
  __esModule: true,
  default: () => null,
}));

const navigationRoute: ActivityLocation[] = [
  { timestamp: 1, coords: { latitude: 55.7, longitude: 37.6 } },
  { timestamp: 2, coords: { latitude: 55.8, longitude: 37.7 } },
];

function createNavigation(): ActivityNavigationContextValue {
  return {
    navigationTrackId: 'track-1',
    navigationRoute,
    isNavigationActive: false,
    hasNavigationStarted: false,
    isNavigationRouteVisible: true,
    startNavigationLabel: 'Start route',
    pauseNavigationLabel: 'Pause route',
    resumeNavigationLabel: 'Resume route',
    finishNavigationLabel: 'Finish route',
    showImportedRouteLabel: 'Show imported route',
    hideImportedRouteLabel: 'Hide imported route',
    downloadOfflineMapLabel: 'Download offline map',
    onToggleNavigationActive: jest.fn(),
    onToggleNavigationRouteVisibility: jest.fn(),
    onFinishNavigation: jest.fn(),
    onDownloadOfflineMap: jest.fn(),
  };
}

describe('NavigationControls', () => {
  beforeEach(() => {
    mockNavigation = null;
    mockReadVisibleBounds.mockReset().mockResolvedValue(null);
    mockPresent.mockClear();
    mockDismiss.mockClear();
  });

  it('hides the controls when there is no selected navigation route', async () => {
    await renderWithProviders(<NavigationControls />);

    expect(screen.queryByTestId('open-navigation-controls')).toBeNull();
  });

  it('exposes navigation actions and downloads an offline map for the route bounds', async () => {
    const navigation = createNavigation();
    mockNavigation = navigation;
    const user = userEvent.setup();
    await renderWithProviders(<NavigationControls />);

    await user.press(screen.getByTestId('toggle-navigation-active'));
    await user.press(screen.getByTestId('download-offline-map-for-route'));

    expect(navigation.onToggleNavigationActive).toHaveBeenCalledTimes(1);
    expect(mockDismiss).toHaveBeenCalledTimes(1);
    expect(navigation.onDownloadOfflineMap).toHaveBeenCalledTimes(1);
    const [bounds, center] = jest.mocked(navigation.onDownloadOfflineMap).mock.calls[0];
    expect(bounds).toEqual([
      [37.7, 55.8],
      [37.6, 55.7],
    ]);
    expect(center[0]).toBeCloseTo(37.65);
    expect(center[1]).toBe(55.75);
  });
});
