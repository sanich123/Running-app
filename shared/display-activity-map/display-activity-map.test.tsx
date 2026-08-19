import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import DisplayActivityMap from './display-activity-map';
import { getActivityMapBounds } from './utils';
import type { LocationObject } from 'expo-location';

jest.mock('@rnmapbox/maps', () => {
  const { View } = require('react-native');
  return {
    MapView: ({ children, ...props }: any) => (
      <View testID="activity-map-view" {...props}>
        {children}
      </View>
    ),
    Camera: (props: any) => <View testID="activity-map-camera" {...props} />,
    MarkerView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    ShapeSource: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    LineLayer: View,
    CircleLayer: View,
    SymbolLayer: View,
  };
});

describe('display activity map', () => {
  it('uses longitude first and latitude second for route bounds', () => {
    const locations = [
      { coords: { longitude: 37.6, latitude: 55.7 } },
      { coords: { longitude: 37.8, latitude: 55.9 } },
    ] as LocationObject[];

    expect(getActivityMapBounds(locations)).toEqual({
      boundBox: [37.6, 55.7, 37.8, 55.9],
      bounds: { ne: [37.8, 55.9], sw: [37.6, 55.7] },
      routeCoordinates: [
        [37.6, 55.7],
        [37.8, 55.9],
      ],
    });
  });

  it('shows a useful empty state when there are not enough valid locations', async () => {
    await renderWithProviders(
      <DisplayActivityMap locations={[{ coords: {} } as LocationObject]} kilometresSplit={[]} />,
    );
    expect(screen.getByText('Недостаточно данных для отображения маршрута')).toBeOnTheScreen();
  });

  it('fits a valid route to the map camera', async () => {
    const locations = [
      { coords: { longitude: 37.6, latitude: 55.7 } },
      { coords: { longitude: 37.8, latitude: 55.9 } },
    ] as LocationObject[];
    await renderWithProviders(<DisplayActivityMap locations={locations} kilometresSplit={[]} />);
    const camera = screen.getByTestId('activity-map-camera');
    expect(camera.props.bounds).toEqual({ ne: [37.8, 55.9], sw: [37.6, 55.7] });
    expect(screen.getByTestId('activity-map-start-marker')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-map-end-marker')).toBeOnTheScreen();
  });

  it('renders zoom controls for the activity map', async () => {
    const locations = [
      { coords: { longitude: 37.6, latitude: 55.7 } },
      { coords: { longitude: 37.8, latitude: 55.9 } },
    ] as LocationObject[];
    await renderWithProviders(<DisplayActivityMap locations={locations} kilometresSplit={[]} />);

    expect(screen.getByTestId('activity-map-increase-zoom')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-map-decrease-zoom')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-map-increase-zoom')).toBeEnabled();
    expect(screen.getByTestId('activity-map-decrease-zoom')).toBeEnabled();
  });
});
