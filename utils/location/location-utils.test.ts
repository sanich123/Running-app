import { getMapBoxImage } from './location-utils';

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
