import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import DisplayActivityMap from './display-activity-map';
import { getActivityMapBounds, getRouteSpeedColors } from './utils';
import type { ActivityLocation } from '@S/card/types';
import type { MockNativeViewProps } from '@T/utils/mock-native-view';
import type * as MockNativeViewTools from '@T/utils/mock-native-view';
import type { LocationObject } from 'expo-location';

jest.mock('@rnmapbox/maps', () => {
  const { createMockNativeView } = require('@T/utils/mock-native-view') as typeof MockNativeViewTools;
  return {
    MapView: ({ children, ...props }: MockNativeViewProps) =>
      createMockNativeView(props, children, 'activity-map-view'),
    Camera: (props: MockNativeViewProps) => createMockNativeView(props, undefined, 'activity-map-camera'),
    MarkerView: ({ children, ...props }: MockNativeViewProps) => createMockNativeView(props, children),
    ShapeSource: ({ children, ...props }: MockNativeViewProps) => createMockNativeView(props, children),
    LineLayer: ({ ...props }: MockNativeViewProps) => createMockNativeView(props),
    CircleLayer: ({ ...props }: MockNativeViewProps) => createMockNativeView(props),
    SymbolLayer: ({ ...props }: MockNativeViewProps) => createMockNativeView(props),
  };
});

describe('display activity map', () => {
  it('uses longitude first and latitude second for route bounds', () => {
    const locations = [
      { coords: { longitude: 37.6, latitude: 55.7 } },
      { coords: { longitude: 37.8, latitude: 55.9 } },
    ] as ActivityLocation[];

    expect(getActivityMapBounds(locations)).toEqual({
      boundBox: [37.6, 55.7, 37.8, 55.9],
      bounds: { ne: [37.8, 55.9], sw: [37.6, 55.7] },
      routeCoordinates: [
        [37.6, 55.7],
        [37.8, 55.9],
      ],
    });
  });

  it('creates a heatmap color for each route segment', () => {
    const locations = [
      { coords: { longitude: 37.6, latitude: 55.7, timestamp: 0 } },
      { coords: { longitude: 37.61, latitude: 55.7, timestamp: 1_000 } },
      { coords: { longitude: 37.63, latitude: 55.7, timestamp: 2_000 } },
    ] as ActivityLocation[];

    const colors = getRouteSpeedColors(locations);

    expect(colors).toHaveLength(2);
    expect(colors.every((color) => /^#[0-9a-f]{6}$/i.test(color))).toBe(true);
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

    expect(screen.getByTestId('activity-map-zoom-in')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-map-zoom-out')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-map-zoom-in')).toBeEnabled();
    expect(screen.getByTestId('activity-map-zoom-out')).toBeEnabled();
  });
});
