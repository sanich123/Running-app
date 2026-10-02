import { screen, userEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { renderWithProviders } from '@T/utils/test-utils';
import MapControls from './map-controls';

describe('activity map controls', () => {
  it('switches map layers and invokes zoom controls', async () => {
    const onMapStyleChange = jest.fn();
    const onZoomIn = jest.fn();
    const onZoomOut = jest.fn();
    const user = userEvent.setup();

    await renderWithProviders(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, right: 0, bottom: 0, left: 0 },
        }}>
        <MapControls
          mapStyle="satellite"
          copy={{ satellite: 'Satellite', map: 'Map', zoomIn: 'Zoom in', zoomOut: 'Zoom out' }}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onMapStyleChange={onMapStyleChange}
          canZoomIn
          canZoomOut
        />
      </SafeAreaProvider>,
    );

    expect(screen.getByTestId('activity-route-style-satellite').props.accessibilityState).toMatchObject({
      selected: true,
    });
    expect(screen.getByTestId('activity-route-style-map').props.accessibilityState).toMatchObject({
      selected: false,
    });

    await user.press(screen.getByTestId('activity-route-style-map'));
    await user.press(screen.getByTestId('activity-route-zoom-in'));
    await user.press(screen.getByTestId('activity-route-zoom-out'));

    expect(onMapStyleChange).toHaveBeenCalledWith('map');
    expect(onZoomIn).toHaveBeenCalledTimes(1);
    expect(onZoomOut).toHaveBeenCalledTimes(1);
  });
});
