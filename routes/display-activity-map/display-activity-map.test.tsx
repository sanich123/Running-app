import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './display-activity-map';
import { getActivityMapBounds } from './display-activity-map';
import type { LocationObject } from 'expo-location';

describe('display activity map', () => {
  it('exports a component', () => expectComponentModule(componentModule));

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
});
