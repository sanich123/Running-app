import * as React from 'react';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MOCK_LOCATION } from '@T/mocks/mock-location';
const mockBrandingChildren = [
  {
    style: {},
    classList: { contains: (className: string) => className === 'mapboxgl-ctrl-attrib' },
  },
  {
    style: {},
    classList: { contains: (className: string) => className === 'mapboxgl-ctrl-logo' },
  },
] as unknown as HTMLElement[];
const mockBrandingContainer = { style: {}, children: mockBrandingChildren } as unknown as HTMLElement;
const mockMapContainer = {
  querySelector: jest.fn((selector: string) =>
    selector === '.mapboxgl-ctrl-bottom-left' ? mockBrandingContainer : null,
  ),
};
const mockMap = {
  addControl: jest.fn(),
  addLayer: jest.fn(),
  addSource: jest.fn(),
  getSource: jest.fn(),
  getContainer: jest.fn(() => mockMapContainer),
  jumpTo: jest.fn(),
  easeTo: jest.fn(),
  zoomTo: jest.fn(),
  setTerrain: jest.fn(),
  remove: jest.fn(),
  on: jest.fn(),
};
const mapConstructor = jest.fn(() => mockMap);
const mockPlaybackMarker = {
  addTo: jest.fn(),
  remove: jest.fn(),
  setLngLat: jest.fn(),
};
mockPlaybackMarker.addTo.mockReturnValue(mockPlaybackMarker);
mockPlaybackMarker.setLngLat.mockReturnValue(mockPlaybackMarker);
const markerConstructor = jest.fn((options: { element: HTMLDivElement; anchor: 'center' }) => {
  void options;
  return mockPlaybackMarker;
});
jest.setMock('mapbox-gl', {
  AttributionControl: jest.fn(),
  Map: mapConstructor,
  Marker: markerConstructor,
});
const MapboxWeb = require('./mapbox-web').default;

async function renderMapboxWeb(element: React.ReactElement) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, right: 0, bottom: 0, left: 0 },
      }}>
      {element}
    </SafeAreaProvider>,
  );
}

function setMockDocument() {
  const createElement = jest.fn((tagName: string) => {
    const children: HTMLElement[] = [];
    return {
      tagName: tagName.toUpperCase(),
      style: {},
      setAttribute: jest.fn(),
      append: jest.fn((child: HTMLElement) => children.push(child)),
      replaceChildren: jest.fn(() => children.splice(0)),
      querySelector: jest.fn(
        (selector: string) => children.find((child) => child.tagName.toLowerCase() === selector) ?? null,
      ),
    } as unknown as HTMLElement;
  });
  const stylesheet = { sheet: {} } as HTMLLinkElement;
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      createElement,
      querySelector: jest.fn((selector: string) => (selector === 'link[data-mapbox-styles]' ? stylesheet : null)),
    },
  });
}

describe('mapbox web', () => {
  beforeEach(() => {
    setMockDocument();
  });

  it('creates a bounded map, aligns its branding, and removes it on unmount', async () => {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
    jest
      .spyOn(React, 'useRef')
      .mockImplementationOnce(() => ({ current: null }))
      .mockImplementationOnce(() => ({ current: {} }));
    mockMap.on.mockImplementationOnce((_event: string, callback: () => void) => callback());
    mapConstructor.mockClear();
    mockMap.remove.mockClear();

    const result = await renderMapboxWeb(
      <MapboxWeb
        boundBox={[37.6, 55.7, 37.8, 55.9]}
        routeCoordinates={[
          [MOCK_LOCATION.coords.longitude, MOCK_LOCATION.coords.latitude],
          [37.8, 55.9],
        ]}
        kilometresSplit={[]}
      />,
    );

    expect(mapConstructor).toHaveBeenCalledWith(expect.objectContaining({ bounds: [37.6, 55.7, 37.8, 55.9] }));
    expect(mockBrandingContainer.style).toMatchObject({ alignItems: 'center', display: 'flex', flexWrap: 'nowrap' });
    expect(mockBrandingChildren[0]?.style).toMatchObject({ clear: 'none', float: 'none', order: '1' });
    expect(mockBrandingChildren[1]?.style).toMatchObject({ clear: 'none', float: 'none', order: '0' });
    await result.unmount();
    expect(mockMap.remove).toHaveBeenCalledTimes(1);
  });

  it('does not add route endpoint icons', async () => {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
    mockMap.addSource.mockClear();
    mockMap.addLayer.mockClear();
    mockMap.on.mockImplementationOnce((_event: string, callback: () => void) => callback());
    await renderMapboxWeb(
      <MapboxWeb
        boundBox={[37.6, 55.7, 37.8, 55.9]}
        routeCoordinates={[
          [37.6, 55.7],
          [37.8, 55.9],
        ]}
        kilometresSplit={[]}
      />,
    );

    expect(mockMap.addSource).not.toHaveBeenCalledWith('route-markers', expect.any(Object));
    expect(mockMap.addLayer).not.toHaveBeenCalledWith(expect.objectContaining({ id: 'route-marker-background' }));
    expect(mockMap.addLayer).not.toHaveBeenCalledWith(expect.objectContaining({ id: 'route-marker-icon' }));
  });

  it('creates and updates the moving route replay marker', async () => {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
    setMockDocument();
    const routeCoordinates = [
      [37.6, 55.7],
      [37.8, 55.9],
    ];
    const boundBox: [number, number, number, number] = [37.6, 55.7, 37.8, 55.9];
    mockMap.addSource.mockClear();
    mockMap.addLayer.mockClear();
    mockPlaybackMarker.setLngLat.mockClear();
    markerConstructor.mockClear();
    mockMap.on.mockImplementationOnce((_event: string, callback: () => void) => callback());

    await renderMapboxWeb(
      <MapboxWeb
        boundBox={boundBox}
        routeCoordinates={routeCoordinates}
        kilometresSplit={[]}
        showPlaybackMarker
        playbackCoordinate={[37.65, 55.75]}
        playbackProfile={{ name: 'Run', surname: 'User', profilePhoto: 'https://example.test/avatar.jpg' }}
      />,
    );

    expect(markerConstructor).toHaveBeenCalledWith(expect.objectContaining({ anchor: 'center' }));
    const markerElement = markerConstructor.mock.calls[0]?.[0].element;
    expect(markerElement.querySelector('img')?.src).toBe('https://example.test/avatar.jpg');
    expect(mockPlaybackMarker.setLngLat).toHaveBeenLastCalledWith([37.65, 55.75]);
  });

  it('updates the replay camera directly on each animation frame', async () => {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
    setMockDocument();
    mockMap.jumpTo.mockClear();
    mockMap.on.mockImplementationOnce((_event: string, callback: () => void) => callback());
    const playbackCameraUpdateRef: { current: ((coordinate: [number, number], heading: number) => void) | null } = {
      current: null,
    };
    mockPlaybackMarker.setLngLat.mockClear();

    await renderMapboxWeb(
      <MapboxWeb
        boundBox={[37.6, 55.7, 37.8, 55.9]}
        routeCoordinates={[
          [37.6, 55.7],
          [37.8, 55.9],
        ]}
        kilometresSplit={[]}
        showPlaybackMarker
        playbackCoordinate={[37.65, 55.75]}
        followPlaybackCamera
        playbackCameraUpdateRef={playbackCameraUpdateRef}
      />,
    );

    playbackCameraUpdateRef.current?.([37.7, 55.8], 125);

    expect(mockMap.jumpTo).toHaveBeenLastCalledWith({ center: [37.7, 55.8], bearing: 125, pitch: 0, zoom: 14.5 });
    expect(mockPlaybackMarker.setLngLat).toHaveBeenLastCalledWith([37.7, 55.8]);
  });

  it('updates playback coordinates without rebuilding the map', async () => {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
    setMockDocument();
    const routeCoordinates = [
      [37.6, 55.7],
      [37.8, 55.9],
    ];
    const boundBox: [number, number, number, number] = [37.6, 55.7, 37.8, 55.9];
    const kilometresSplit: [] = [];
    mockMap.on.mockImplementationOnce((_event: string, callback: () => void) => callback());
    mapConstructor.mockClear();
    mockMap.remove.mockClear();
    mockPlaybackMarker.setLngLat.mockClear();
    const result = await renderMapboxWeb(
      <MapboxWeb
        boundBox={boundBox}
        routeCoordinates={routeCoordinates}
        kilometresSplit={kilometresSplit}
        showPlaybackMarker
        playbackCoordinate={[37.65, 55.75]}
      />,
    );

    await result.rerender(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, right: 0, bottom: 0, left: 0 },
        }}>
        <MapboxWeb
          boundBox={boundBox}
          routeCoordinates={routeCoordinates}
          kilometresSplit={kilometresSplit}
          showPlaybackMarker
          playbackCoordinate={[37.7, 55.8]}
        />
      </SafeAreaProvider>,
    );

    expect(mockPlaybackMarker.setLngLat).toHaveBeenLastCalledWith([37.7, 55.8]);
    expect(mapConstructor).toHaveBeenCalledTimes(1);
    expect(mockMap.remove).not.toHaveBeenCalled();
    await result.unmount();
  });

  it('filters invalid kilometre points and adds valid split layers', async () => {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
    mockMap.addSource.mockClear();
    mockMap.addLayer.mockClear();
    mockMap.on.mockImplementationOnce((_event: string, callback: () => void) => callback());

    await renderMapboxWeb(
      <MapboxWeb
        boundBox={[37.6, 55.7, 37.8, 55.9]}
        routeCoordinates={[]}
        kilometresSplit={[
          { kilometerPoint: { coords: { longitude: 37.6, latitude: 55.7 } } } as unknown,
          { kilometerPoint: { coords: { longitude: Number.NaN, latitude: 55.8 } } } as unknown,
          { kilometerPoint: undefined } as unknown,
        ]}
      />,
    );

    const splitSource = mockMap.addSource.mock.calls.find(([id]) => id === 'kilometre-splits');
    expect(splitSource?.[1].data.features).toHaveLength(1);
    expect(splitSource?.[1].data.features[0].properties).toEqual({ label: '1', sortKey: 0 });
    expect(mockMap.addLayer).toHaveBeenCalledWith(expect.objectContaining({ id: 'kilometre-split-hit-area' }));
    expect(mockMap.addLayer).toHaveBeenCalledWith(expect.objectContaining({ id: 'kilometre-split-background' }));
    const splitBackgroundLayer = mockMap.addLayer.mock.calls.find(
      ([layer]) => layer.id === 'kilometre-split-background',
    )?.[0];
    const splitHitAreaLayer = mockMap.addLayer.mock.calls.find(
      ([layer]) => layer.id === 'kilometre-split-hit-area',
    )?.[0];
    expect(splitBackgroundLayer.layout['circle-sort-key']).toEqual(['get', 'sortKey']);
    expect(splitBackgroundLayer.paint['circle-color']).toEqual(expect.any(String));
    expect(splitBackgroundLayer.paint['circle-radius']).toBe(5.5);
    expect(splitHitAreaLayer.paint['circle-radius']).toBe(14);
    expect(splitHitAreaLayer.paint['circle-opacity']).toBe(0.01);
    expect(mockMap.addLayer).not.toHaveBeenCalledWith(expect.objectContaining({ id: 'kilometre-split-label' }));
  });

  it('adds terrain, a heat-colored route gradient, fallback avatar, and animated playback camera controls', async () => {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
    setMockDocument();
    mockMap.addSource.mockClear();
    mockMap.addLayer.mockClear();
    mockMap.setTerrain.mockClear();
    mockMap.easeTo.mockClear();
    mockMap.zoomTo.mockClear();
    mockMap.on.mockImplementationOnce((_event: string, callback: () => void) => callback());
    const playbackCameraUpdateRef: {
      current:
        ((coordinate: [number, number], heading: number, zoomLevel?: number, durationMs?: number) => void) | null;
    } = { current: null };
    const mapControlsRef: { current: { zoomTo: (zoomLevel: number, durationMs?: number) => void } | null } = {
      current: null,
    };
    const result = await renderMapboxWeb(
      <MapboxWeb
        boundBox={[37.6, 55.7, 37.8, 55.9]}
        routeCoordinates={[
          [37.6, 55.7],
          [37.7, 55.8],
          [37.8, 55.9],
        ]}
        routeSegmentColors={['green', 'red']}
        kilometresSplit={[]}
        showPlaybackMarker
        followPlaybackCamera
        playbackProfile={{ name: 'Run', surname: 'User' }}
        enable3DTerrain
        playbackCameraUpdateRef={playbackCameraUpdateRef}
        mapControlsRef={mapControlsRef}
      />,
    );

    expect(mockMap.addSource).toHaveBeenCalledWith('activity-route-replay-terrain', expect.any(Object));
    expect(mockMap.setTerrain).toHaveBeenCalledWith({
      source: 'activity-route-replay-terrain',
      exaggeration: expect.any(Number),
    });
    const routeBaseSource = mockMap.addSource.mock.calls.find(([id]) => id === 'route-base');
    expect(routeBaseSource?.[1].data.features?.[0]?.geometry.coordinates).toEqual([
      [37.6, 55.7],
      [37.7, 55.8],
      [37.8, 55.9],
    ]);
    const routeSource = mockMap.addSource.mock.calls.find(([id]) => id === 'route');
    expect(routeSource?.[1].lineMetrics).toBe(true);
    expect(routeSource?.[1].data.features).toEqual([
      expect.objectContaining({
        geometry: {
          type: 'LineString',
          coordinates: [
            [37.6, 55.7],
            [37.7, 55.8],
            [37.8, 55.9],
          ],
        },
      }),
    ]);
    const routeLine = mockMap.addLayer.mock.calls.find(([layer]) => layer.id === 'route-line')?.[0];
    expect(routeLine?.paint['line-gradient']).toEqual(expect.arrayContaining(['green', 'red']));
    expect(routeLine?.paint['line-emissive-strength']).toBe(1);
    expect(routeLine?.paint['line-width']).toBe(5);
    const markerElement = markerConstructor.mock.calls.at(-1)?.[0].element;
    expect(markerElement?.querySelector('span')?.textContent).toBe('RU');

    mapControlsRef.current?.zoomTo(17, 300);
    expect(mockMap.zoomTo).toHaveBeenCalledWith(17, { duration: 300 });
    playbackCameraUpdateRef.current?.([37.7, 55.8], 245, 16, 500);
    expect(mockMap.easeTo).toHaveBeenCalledWith({
      center: [37.7, 55.8],
      bearing: 245,
      pitch: 0,
      zoom: 16,
      duration: 500,
    });

    await result.unmount();
    expect(playbackCameraUpdateRef.current).toBeNull();
    expect(mapControlsRef.current).toBeNull();
    expect(mockPlaybackMarker.remove).toHaveBeenCalled();
  });

  it('keeps rendering when browser map globals are unavailable', async () => {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: undefined });
    jest
      .spyOn(React, 'useRef')
      .mockImplementationOnce(() => ({ current: null }))
      .mockImplementationOnce(() => ({ current: {} }));
    mapConstructor.mockClear();

    await renderMapboxWeb(<MapboxWeb boundBox={[0, 0, 1, 1]} routeCoordinates={[]} kilometresSplit={[]} />);

    expect(mapConstructor).not.toHaveBeenCalled();
  });
});
