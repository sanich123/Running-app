import type { RefObject } from 'react';
import { render, screen } from '@testing-library/react-native';
import NavigationRouteLayer from './navigation-route-layer';
import type { ActivityNavigationContextValue } from '../../navigation-context';
import type { Camera } from '@rnmapbox/maps';
import type { ActivityLocation } from '@S/card/types';

const mockFitBounds = jest.fn();
let mockNavigation: ActivityNavigationContextValue | null = null;

jest.mock('../../navigation-context', () => ({
  useActivityNavigationContext: () => mockNavigation,
}));

jest.mock('@S/display-activity-map/map-route-line/map-route-line', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="navigation-route-line" /> };
});

const route: ActivityLocation[] = [
  { timestamp: 1, coords: { latitude: 55.7, longitude: 37.6 } },
  { timestamp: 2, coords: { latitude: 55.8, longitude: 37.7 } },
];

function createNavigation(isNavigationRouteVisible = true): ActivityNavigationContextValue {
  return {
    navigationTrackId: 'track-1',
    navigationRoute: route,
    isNavigationActive: true,
    hasNavigationStarted: true,
    isNavigationRouteVisible,
    startNavigationLabel: 'Start',
    pauseNavigationLabel: 'Pause',
    resumeNavigationLabel: 'Resume',
    finishNavigationLabel: 'Finish',
    showImportedRouteLabel: 'Show route',
    hideImportedRouteLabel: 'Hide route',
    downloadOfflineMapLabel: 'Download map',
    onToggleNavigationActive: jest.fn(),
    onToggleNavigationRouteVisibility: jest.fn(),
    onFinishNavigation: jest.fn(),
    onDownloadOfflineMap: jest.fn(),
  };
}

describe('NavigationRouteLayer', () => {
  beforeEach(() => {
    mockFitBounds.mockClear();
    mockNavigation = createNavigation();
  });

  it('draws a visible route and fits the camera after the map has loaded', async () => {
    const cameraRef = { current: { fitBounds: mockFitBounds } } as unknown as RefObject<Camera | null>;
    await render(<NavigationRouteLayer cameraRef={cameraRef} canRenderMap hasMapLoaded />);

    expect(screen.getByTestId('navigation-route-line')).toBeOnTheScreen();
    expect(mockFitBounds).toHaveBeenCalledWith([37.7, 55.8], [37.6, 55.7], [56, 56, 56, 56], 500);
  });

  it('does not draw or fit a hidden route', async () => {
    mockNavigation = createNavigation(false);
    const cameraRef = { current: { fitBounds: mockFitBounds } } as unknown as RefObject<Camera | null>;
    await render(<NavigationRouteLayer cameraRef={cameraRef} canRenderMap hasMapLoaded />);

    expect(screen.queryByTestId('navigation-route-line')).toBeNull();
    expect(mockFitBounds).not.toHaveBeenCalled();
  });
});
