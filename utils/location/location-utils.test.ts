import { MAX_ACTIVITY_LOCATIONS } from './const';
import { getMapBoxImage, getReducedLocations } from './location-utils';

describe('getMapBoxImage', () => {
  it('requests a square map for the square share image', () => {
    const imageUrl = getMapBoxImage([
      { coords: { latitude: 55.75, longitude: 37.61 } },
      { coords: { latitude: 55.76, longitude: 37.62 } },
    ]);

    expect(imageUrl).toContain('/360x360@2x');
  });

  it('requests a map with the dimensions of the activity card', () => {
    const imageUrl = getMapBoxImage(
      [{ coords: { latitude: 55.75, longitude: 37.61 } }, { coords: { latitude: 55.76, longitude: 37.62 } }],
      { width: 351, height: 202 },
    );

    expect(imageUrl).toContain('/351x202@2x');
  });
});

describe('getReducedLocations', () => {
  it('keeps the client payload within the activity location limit', () => {
    const locations = Array.from({ length: MAX_ACTIVITY_LOCATIONS + 250 }, (_, index) => ({
      coords: { latitude: 55 + index / 100_000, longitude: 37 + index / 100_000 },
    }));

    const reducedLocations = getReducedLocations(locations);

    expect(reducedLocations).toHaveLength(MAX_ACTIVITY_LOCATIONS);
    expect(reducedLocations[0]).toBe(locations[0]);
    expect(reducedLocations.at(-1)).toBe(locations.at(-1));
  });
});
