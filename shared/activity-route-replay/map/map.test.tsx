import { createRef, type Ref } from 'react';
import { act, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import ReplayMap from './map';
import type { ReplayMapHandle } from '../types';
import type { ActivityLocation } from '@S/card/types';

const mockSetCamera = jest.fn();
const locations = [
  { coords: { longitude: 37.6, latitude: 55.7 } },
  { coords: { longitude: 37.7, latitude: 55.8 } },
] as ActivityLocation[];

jest.mock('@rnmapbox/maps', () => {
  const ReactModule = require('react');
  const { View: NativeView } = require('react-native');

  return {
    Camera: ReactModule.forwardRef((_props: unknown, ref: Ref<unknown>) => {
      ReactModule.useImperativeHandle(ref, () => ({ setCamera: mockSetCamera }));
      return null;
    }),
    MapView: NativeView,
    MarkerView: NativeView,
    RasterDemSource: NativeView,
    Terrain: NativeView,
    ShapeSource: NativeView,
    LineLayer: NativeView,
  };
});

describe('route replay map', () => {
  const originalPlatformOS = Platform.OS;

  beforeEach(() => {
    mockSetCamera.mockClear();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatformOS });
  });

  it('shows the moving user avatar and follows camera updates', async () => {
    const mapRef = createRef<ReplayMapHandle>();
    await renderWithProviders(
      <ReplayMap
        ref={mapRef}
        locations={locations}
        boundBox={[37.6, 55.7, 37.7, 55.8]}
        routeCoordinates={[
          [37.6, 55.7],
          [37.7, 55.8],
        ]}
        routeSegmentColors={[]}
        mapStyle="satellite"
        playbackCoordinate={[37.65, 55.75]}
        playbackHeading={45}
        profile={{ name: 'Run', surname: 'User', profilePhoto: 'https://example.test/avatar.jpg' }}
      />,
    );

    expect(screen.getByTestId('activity-route-moving-marker')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-route-moving-avatar').props.source).toEqual({
      uri: 'https://example.test/avatar.jpg',
    });

    act(() => mapRef.current?.updateCamera([37.66, 55.76], 90));
    expect(mockSetCamera).toHaveBeenCalledWith({
      centerCoordinate: [37.66, 55.76],
      heading: 90,
      pitch: 60,
      zoomLevel: 14.5,
      animationMode: 'moveTo',
      animationDuration: 0,
    });
  });
});
