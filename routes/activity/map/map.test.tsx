import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { getCurrentPositionAsync } from 'expo-location';
import type * as ReactNative from 'react-native';
import { setInitialLocation, setLastPosition } from '@R/slices/location/location';
import { setIsProfileFilled } from '@R/slices/settings/settings';
import { MOCK_SERVER_IDS } from '@T/responses/runich';
import { mockStore, setMockUserId, resetMockLocation } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import Map from './map';
import type { MockNativeViewProps } from '@T/utils/mock-native-view';
import type * as MockNativeViewTools from '@T/utils/mock-native-view';

const mockSetCamera = jest.fn();
jest.mock('@rnmapbox/maps', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native') as typeof ReactNative;
  const { createMockNativeView } = require('@T/utils/mock-native-view') as typeof MockNativeViewTools;
  const Camera = React.forwardRef((props: MockNativeViewProps, ref: React.Ref<unknown>) => {
    React.useImperativeHandle(ref, () => ({ setCamera: mockSetCamera }));
    return createMockNativeView(props, undefined, 'recording-map-camera', ref);
  });
  return {
    MapView: View,
    Camera,
    MarkerView: View,
    UserLocation: (props: MockNativeViewProps) => createMockNativeView(props, undefined, 'mapbox-user-location'),
  };
});
jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn(),
  useForegroundPermissions: () => [{ granted: true }, jest.fn()],
  useBackgroundPermissions: () => [{ granted: true }, jest.fn()],
}));
jest.mock('@Routes/activity/battery-optimization-modal/battery-optimization-modal', () => () => null);
jest.mock('@S/display-activity-map/route-kilometre-markers/route-kilometre-markers', () => () => null);
jest.mock('@S/display-activity-map/map-route-line/map-route-line', () => () => null);
jest.mock('./location-permissions/location-permissions', () => () => null);

describe('activity recording map', () => {
  beforeEach(() => {
    mockSetCamera.mockClear();
    mockStore.dispatch(resetMockLocation());
    mockStore.dispatch(setMockUserId(MOCK_SERVER_IDS.userId));
    mockStore.dispatch(setIsProfileFilled(true));
  });

  it('marks recording ready and recenters the camera on the current location', async () => {
    const user = userEvent.setup();
    const onLocationReadinessChange = jest.fn();
    mockStore.dispatch(setInitialLocation({ timestamp: 1000, coords: { longitude: 37.6, latitude: 55.7 } }));
    (getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      timestamp: 3000,
      coords: { longitude: 37.61, latitude: 55.71 },
    });
    await renderWithProviders(<Map onLocationReadinessChange={onLocationReadinessChange} />);
    await waitFor(() => expect(onLocationReadinessChange).toHaveBeenCalledWith(true));
    mockSetCamera.mockClear();
    await user.press(await screen.findByTestId('move-to-current-location'));
    expect(getCurrentPositionAsync).toHaveBeenCalledWith({ accuracy: 6 });
    await waitFor(() =>
      expect(mockSetCamera).toHaveBeenLastCalledWith(
        expect.objectContaining({ centerCoordinate: [37.61, 55.71], zoomLevel: 18, animationMode: 'easeTo' }),
      ),
    );

    await act(async () => {
      mockStore.dispatch(setLastPosition({ timestamp: 2000, coords: { longitude: 37.6, latitude: 55.7 } }));
    });
    expect(mockSetCamera).toHaveBeenLastCalledWith(
      expect.objectContaining({ centerCoordinate: [37.61, 55.71], zoomLevel: 18 }),
    );
  });

  it('follows the newest app location and centers instantly on the first point', async () => {
    const onLocationReadinessChange = jest.fn();
    mockStore.dispatch(setInitialLocation({ timestamp: 1000, coords: { longitude: 37.6, latitude: 55.7 } }));

    await renderWithProviders(<Map onLocationReadinessChange={onLocationReadinessChange} />);

    await waitFor(() =>
      expect(mockSetCamera).toHaveBeenLastCalledWith(
        expect.objectContaining({
          centerCoordinate: [37.6, 55.7],
          zoomLevel: 18,
          animationMode: 'none',
          animationDuration: 0,
        }),
      ),
    );
    expect(screen.getByTestId('recording-map-camera').props.followUserLocation).toBe(false);

    mockSetCamera.mockClear();
    await act(async () => {
      mockStore.dispatch(setLastPosition({ timestamp: 2000, coords: { longitude: 37.61, latitude: 55.71 } }));
    });

    await waitFor(() =>
      expect(mockSetCamera).toHaveBeenLastCalledWith(
        expect.objectContaining({ centerCoordinate: [37.61, 55.71], zoomLevel: 18, animationMode: 'easeTo' }),
      ),
    );
  });

  it('shows a loading indicator while the current location is being resolved', async () => {
    const user = userEvent.setup();
    const onLocationReadinessChange = jest.fn();
    let resolveLocation!: (location: unknown) => void;
    (getCurrentPositionAsync as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLocation = resolve;
        }),
    );
    mockStore.dispatch(setMockUserId(MOCK_SERVER_IDS.userId));
    await renderWithProviders(<Map onLocationReadinessChange={onLocationReadinessChange} />);

    await user.press(await screen.findByTestId('move-to-current-location'));
    expect(screen.getByTestId('current-location-loading')).toBeOnTheScreen();

    resolveLocation({ coords: { longitude: 37.6, latitude: 55.7 } });
    await waitFor(() => expect(screen.queryByTestId('current-location-loading')).not.toBeOnTheScreen());
  });

  it('changes the map zoom with the plus and minus controls', async () => {
    const user = userEvent.setup();
    const onLocationReadinessChange = jest.fn();
    mockStore.dispatch(setInitialLocation({ timestamp: 1000, coords: { longitude: 37.6, latitude: 55.7 } }));
    await renderWithProviders(<Map onLocationReadinessChange={onLocationReadinessChange} />);

    await user.press(await screen.findByTestId('increase-map-zoom'));
    await waitFor(() =>
      expect(mockSetCamera).toHaveBeenLastCalledWith(
        expect.objectContaining({ centerCoordinate: [37.6, 55.7], zoomLevel: 19 }),
      ),
    );

    await act(async () => {
      mockStore.dispatch(setLastPosition({ timestamp: 2000, coords: { longitude: 37.61, latitude: 55.71 } }));
    });
    await waitFor(() =>
      expect(mockSetCamera).toHaveBeenLastCalledWith(
        expect.objectContaining({ centerCoordinate: [37.61, 55.71], zoomLevel: 19 }),
      ),
    );

    await user.press(screen.getByTestId('decrease-map-zoom'));
    await waitFor(() =>
      expect(mockSetCamera).toHaveBeenLastCalledWith(
        expect.objectContaining({ centerCoordinate: [37.61, 55.71], zoomLevel: 18 }),
      ),
    );
  });

  it('hides the native puck after Redux has a canonical activity position', async () => {
    const onLocationReadinessChange = jest.fn();
    mockStore.dispatch(setInitialLocation({ coords: { longitude: 37.6, latitude: 55.7 } }));

    await renderWithProviders(<Map onLocationReadinessChange={onLocationReadinessChange} />);

    expect(screen.getByTestId('mapbox-user-location').props.visible).toBe(false);
  });

  it('keeps the native puck visible until Redux has a canonical position', async () => {
    const onLocationReadinessChange = jest.fn();

    await renderWithProviders(<Map onLocationReadinessChange={onLocationReadinessChange} />);

    expect(screen.getByTestId('mapbox-user-location').props.visible).toBe(true);
  });
});
