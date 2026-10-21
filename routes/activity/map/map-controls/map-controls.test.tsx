import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import MapControls from './map-controls';

describe('MapControls', () => {
  it('updates zoom and stops following the user when zooming in', async () => {
    const setCamera = jest.fn();
    const onZoomLevelChange = jest.fn();
    const onFollowUserLocationChange = jest.fn();
    await renderWithProviders(
      <MapControls
        cameraRef={{ current: { setCamera } } as never}
        mapZoomLevel={8}
        isCenteringOnCurrentLocation={false}
        onZoomLevelChange={onZoomLevelChange}
        onFollowUserLocationChange={onFollowUserLocationChange}
        onCenterOnCurrentLocation={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByTestId('increase-map-zoom'));

    expect(onZoomLevelChange).toHaveBeenCalledWith(9);
    expect(onFollowUserLocationChange).toHaveBeenCalledWith(false);
    expect(setCamera).toHaveBeenCalledWith({ zoomLevel: 9, animationMode: 'easeTo', animationDuration: 250 });
  });
});
