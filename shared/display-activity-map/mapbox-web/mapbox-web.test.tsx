import * as React from 'react';
import { render } from '@testing-library/react-native';
import { MOCK_LOCATION } from '@T/mocks/mock-location';
const mockMap = {
  addControl: jest.fn(),
  addLayer: jest.fn(),
  addSource: jest.fn(),
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
});
