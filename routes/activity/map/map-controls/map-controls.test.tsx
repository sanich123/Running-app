import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityMapContext from '../activity-map-context';
import MapControls from './map-controls';

const activityMapContext = {
  mapControls: {
    mapZoomLevel: 8,
    isCenteringOnCurrentLocation: false,
    onZoomIn: jest.fn(),
    onZoomOut: jest.fn(),
    onCenterOnCurrentLocation: jest.fn(),
  },
  locationPermissions: {
    isMapVisible: true,
    isLocationEnabled: true,
    foregroundPermissionStatus: null,
    backgroundPermissionStatus: null,
    setIsLocationEnabled: jest.fn(),
    requestForegroundPermission: jest.fn(),
    requestBackgroundPermission: jest.fn(),
  },
  batteryOptimization: { isActive: false, setIsNeedToRefreshPermission: jest.fn() },
};

describe('MapControls', () => {
  it('delegates zoom changes to the map controller', async () => {
    const user = userEvent.setup();
    await renderWithProviders(
      <ActivityMapContext.Provider value={activityMapContext}>
        <MapControls />
      </ActivityMapContext.Provider>,
    );

    await user.press(screen.getByTestId('increase-map-zoom'));
    await user.press(screen.getByTestId('decrease-map-zoom'));

    expect(activityMapContext.mapControls.onZoomIn).toHaveBeenCalledTimes(1);
    expect(activityMapContext.mapControls.onZoomOut).toHaveBeenCalledTimes(1);
  });
});
