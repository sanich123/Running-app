import { parseImportedRoute } from './route-import';

describe('parse imported route', () => {
  it('reads GPX track points, title, elevation and timestamps', () => {
    const route = parseImportedRoute(
      'morning.gpx',
      '<gpx><trk><name>Morning &amp; run</name><trkseg><trkpt lat="55.7" lon="37.6"><ele>150</ele><time>2026-10-29T06:00:00.000Z</time></trkpt><trkpt lat="55.8" lon="37.7"/></trkseg></trk></gpx>',
    );

    expect(route.title).toBe('Morning & run');
    expect(route.locations).toEqual([
      {
        coords: { latitude: 55.7, longitude: 37.6, altitude: 150, timestamp: Date.parse('2026-10-29T06:00:00.000Z') },
        timestamp: Date.parse('2026-10-29T06:00:00.000Z'),
      },
      { coords: { latitude: 55.8, longitude: 37.7 } },
    ]);
  });

  it('reads coordinates from a KML route and falls back to the filename', () => {
    const route = parseImportedRoute(
      'park-loop.kml',
      '<kml><LineString><coordinates>37.6,55.7,140 37.7,55.8,145</coordinates></LineString></kml>',
    );

    expect(route.title).toBe('park-loop');
    expect(route.locations.map(({ coords }) => coords)).toEqual([
      { longitude: 37.6, latitude: 55.7, altitude: 140 },
      { longitude: 37.7, latitude: 55.8, altitude: 145 },
    ]);
  });

  it('rejects unsupported files and routes without two valid points', () => {
    expect(() => parseImportedRoute('route.json', '[]')).toThrow('Choose a GPX or KML route file');
    expect(() => parseImportedRoute('route.gpx', '<gpx><trkpt lat="55.7" lon="37.6"/></gpx>')).toThrow(
      'The route file must contain at least two valid points',
    );
  });
});
