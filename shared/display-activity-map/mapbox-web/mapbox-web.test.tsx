import * as React from 'react';
import { render } from '@testing-library/react-native';
import { MOCK_LOCATION } from '@T/mocks/mock-location';
const mockMap = {
  addControl: jest.fn(),
  addLayer: jest.fn(),
  addSource: jest.fn(),
  getSource: jest.fn(),
  remove: jest.fn(),
  on: jest.fn(),
};
const mapConstructor = jest.fn(() => mockMap);
jest.setMock('mapbox-gl', { Map: mapConstructor });
const MapboxWeb = require('./mapbox-web').default;

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
    const playbackSource = { setData: jest.fn() };
    const routeCoordinates = [
      [37.6, 55.7],
      [37.8, 55.9],
    ];
    mockMap.addSource.mockClear();
    mockMap.addLayer.mockClear();
    mockMap.on.mockImplementationOnce((_event: string, callback: () => void) => callback());
    mockMap.getSource.mockReturnValue(playbackSource);

    const result = await render(
      <MapboxWeb
        boundBox={[37.6, 55.7, 37.8, 55.9]}
        routeCoordinates={routeCoordinates}
        kilometresSplit={[]}
        showPlaybackMarker
        playbackCoordinate={[37.65, 55.75]}
      />,
    );

    const playbackMarker = mockMap.addSource.mock.calls.find(([id]) => id === 'route-playback-marker');
    expect(playbackMarker?.[1].data.geometry.coordinates).toEqual([37.65, 55.75]);
    expect(mockMap.addLayer).toHaveBeenCalledWith(expect.objectContaining({ id: 'route-playback-marker' }));

    await result.rerender(
      <MapboxWeb
        boundBox={[37.6, 55.7, 37.8, 55.9]}
        routeCoordinates={routeCoordinates}
        kilometresSplit={[]}
        showPlaybackMarker
        playbackCoordinate={[37.7, 55.8]}
      />,
    );

    expect(playbackSource.setData).toHaveBeenLastCalledWith({
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [37.7, 55.8] },
    });
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
