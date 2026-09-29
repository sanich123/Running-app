import * as React from 'react';
import { render } from '@testing-library/react-native';
import { MOCK_LOCATION } from '@T/mocks/mock-location';
const mockMap = {
  addControl: jest.fn(),
  addLayer: jest.fn(),
  addSource: jest.fn(),
  getSource: jest.fn(),
  jumpTo: jest.fn(),
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
jest.setMock('mapbox-gl', { Map: mapConstructor, Marker: markerConstructor });
const MapboxWeb = require('./mapbox-web').default;

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
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement } });
}

describe('mapbox web', () => {
  it('creates a bounded map and removes it on unmount', async () => {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
    jest
      .spyOn(React, 'useRef')
      .mockImplementationOnce(() => ({ current: null }) as any)
      .mockImplementationOnce(() => ({ current: {} }) as any);
    mapConstructor.mockClear();
    mockMap.remove.mockClear();

    const result = await render(
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
    await result.unmount();
    expect(mockMap.remove).toHaveBeenCalledTimes(1);
  });

  it('adds play and stop markers for the route endpoints', async () => {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
    mockMap.addSource.mockClear();
    mockMap.addLayer.mockClear();
    mockMap.on.mockImplementationOnce((_event: string, callback: () => void) => callback());
    await render(
      <MapboxWeb
        boundBox={[37.6, 55.7, 37.8, 55.9]}
        routeCoordinates={[
          [37.6, 55.7],
          [37.8, 55.9],
        ]}
        kilometresSplit={[]}
      />,
    );

    const markerSource = mockMap.addSource.mock.calls.find(([id]) => id === 'route-markers');
    expect(markerSource?.[1].data.features).toEqual([
      expect.objectContaining({ properties: { icon: '▶', markerType: 'start' } }),
      expect.objectContaining({ properties: { icon: '■', markerType: 'end' } }),
    ]);
    expect(mockMap.addLayer).toHaveBeenCalledWith(expect.objectContaining({ id: 'route-marker-background' }));
    expect(mockMap.addLayer).toHaveBeenCalledWith(expect.objectContaining({ id: 'route-marker-icon' }));
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

    await render(
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

    await render(
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

  it('filters invalid kilometre points and adds valid split layers', async () => {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
    mockMap.addSource.mockClear();
    mockMap.addLayer.mockClear();
    mockMap.on.mockImplementationOnce((_event: string, callback: () => void) => callback());

    await render(
      <MapboxWeb
        boundBox={[37.6, 55.7, 37.8, 55.9]}
        routeCoordinates={[]}
        kilometresSplit={[
          { kilometerPoint: { coords: { longitude: 37.6, latitude: 55.7 } } } as any,
          { kilometerPoint: { coords: { longitude: Number.NaN, latitude: 55.8 } } } as any,
          { kilometerPoint: undefined } as any,
        ]}
      />,
    );

    const splitSource = mockMap.addSource.mock.calls.find(([id]) => id === 'kilometre-splits');
    expect(splitSource?.[1].data.features).toHaveLength(1);
    expect(splitSource?.[1].data.features[0].properties).toEqual({ label: '1', sortKey: 0 });
    expect(mockMap.addLayer).toHaveBeenCalledWith(expect.objectContaining({ id: 'kilometre-split-background' }));
    expect(mockMap.addLayer).toHaveBeenCalledWith(expect.objectContaining({ id: 'kilometre-split-label' }));
    const splitBackgroundLayer = mockMap.addLayer.mock.calls.find(
      ([layer]) => layer.id === 'kilometre-split-background',
    )?.[0];
    const splitLabelLayer = mockMap.addLayer.mock.calls.find(([layer]) => layer.id === 'kilometre-split-label')?.[0];
    expect(splitBackgroundLayer.layout['circle-sort-key']).toEqual(['get', 'sortKey']);
    expect(splitLabelLayer.layout['symbol-sort-key']).toEqual(['get', 'sortKey']);
    expect(splitLabelLayer.layout['text-allow-overlap']).toBe(true);
    expect(splitLabelLayer.layout['text-ignore-placement']).toBe(true);
    expect(splitLabelLayer.layout['text-padding']).toBe(12);
    const markerSource = mockMap.addSource.mock.calls.find(([id]) => id === 'route-markers');
    expect(markerSource?.[1].data.features).toEqual([]);
  });
});
