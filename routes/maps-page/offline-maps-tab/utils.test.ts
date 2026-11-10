import { getOfflineMapBoundsCenter, isMapboxTileLimitError, parseOfflineMapPackBounds } from './utils';

describe('offline map bounds', () => {
  it('reads the four-number bounds returned by Mapbox on iOS after app restart', () => {
    expect(parseOfflineMapPackBounds([38, 56, 37, 55])).toEqual([
      [38, 56],
      [37, 55],
    ]);
  });

  it('keeps support for GeoJSON bounds from packs created in the current app session', () => {
    expect(
      parseOfflineMapPackBounds(
        JSON.stringify({
          type: 'FeatureCollection',
          features: [
            { type: 'Feature', geometry: { type: 'Point', coordinates: [38, 56] } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: [37, 55] } },
          ],
        }),
      ),
    ).toEqual([
      [38, 56],
      [37, 55],
    ]);
  });

  it('rejects invalid native bounds and finds the center of an antimeridian region', () => {
    expect(parseOfflineMapPackBounds([181, 56, 37, 55])).toBeNull();
    expect(parseOfflineMapPackBounds([38, 55, 37, 56])).toBeNull();
    expect(
      getOfflineMapBoundsCenter([
        [-170, 20],
        [170, 10],
      ]),
    ).toEqual([-180, 15]);
  });

  it('recognizes Mapbox offline tile-limit errors', () => {
    expect(
      isMapboxTileLimitError(
        new Error(
          "The tile region can't be loaded because it would increase the number of Maps tiles to 1711, which is beyond the maximum allowed 750 tiles.",
        ),
      ),
    ).toBe(true);
    expect(isMapboxTileLimitError(new Error('Tile request failed'))).toBe(false);
  });
});
