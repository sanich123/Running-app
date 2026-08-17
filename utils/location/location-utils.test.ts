import { getMapBoxImage } from './location-utils';

describe('getMapBoxImage', () => {
  it('requests a square map for the square share image', () => {
    const imageUrl = getMapBoxImage([
      { coords: { latitude: 55.75, longitude: 37.61 } },
      { coords: { latitude: 55.76, longitude: 37.62 } },
    ]);

    expect(imageUrl).toContain('/360x360@2x');
  });
});
