import { LANGUAGES } from '@const/enums';
import { getLiveLastKmMetric, getLiveMainMetric, getLiveTopMetric } from './utils';
import type { LastKmSplit } from '@R/slices/location/types';

describe('live activity metrics', () => {
  it.each([
    ['run', 'Pace', '5.00 /km'],
    ['walk', 'Speed', '12.0 km/h'],
    ['bike', 'Speed', '12.0 km/h'],
    ['hike', 'Speed', '12.0 km/h'],
  ])('uses the sport-specific main metric for %s', (sport, title, metric) => {
    expect(getLiveMainMetric({ sport, distance: 1_000, duration: 300_000, language: LANGUAGES.english })).toEqual({
      title,
      metric,
    });
  });

  it.each([
    ['run', '05:00'],
    ['walk', '60.0 km/h'],
    ['bike', '12.0 km/h'],
    ['hike', '12.0 km/h'],
  ])('uses the sport-specific last kilometre metric for %s', (sport, expectedMetric) => {
    expect(
      getLiveLastKmMetric({
        sport,
        split: {
          lastKilometerDuration: sport === 'walk' ? 60_000 : 300_000,
          lastKilometerAltitude: 0,
          ...(sport === 'walk' ? { lastKilometerSteps: 120 } : {}),
          kilometerPoint: {} as LastKmSplit['kilometerPoint'],
        },
        language: LANGUAGES.english,
      }),
    ).toBe(expectedMetric);
  });

  it('uses a zero pace when running has no completed kilometre split', () => {
    expect(getLiveLastKmMetric({ sport: 'run', language: LANGUAGES.english })).toBe('00:00');
  });

  it.each([
    ['walk', 'Steps', '1234'],
    ['hike', 'Steps', '1234'],
    ['run', 'Elevation gain', '42 m'],
    ['bike', 'Elevation gain', '42 m'],
  ])('uses the sport-specific top metric for %s', (sport, title, metric) => {
    expect(getLiveTopMetric({ sport, altitude: 42, steps: 1234, language: LANGUAGES.english })).toEqual({
      title,
      metric,
    });
  });

  it('does not render a negative elevation gain', () => {
    expect(getLiveTopMetric({ sport: 'bike', altitude: -12, steps: 0, language: LANGUAGES.english })).toEqual({
      title: 'Elevation gain',
      metric: '0 m',
    });
  });
});
