import { createRouteTimeline, getRouteCoordinateAtProgress, smoothRouteHeading } from './utils';
import type { ActivityLocation } from '@S/card/types';

const location = (longitude: number, latitude: number): ActivityLocation => ({
  coords: { longitude, latitude },
});

describe('activity route replay timeline', () => {
  it('returns no marker for an empty route and the same marker for a one-point route', () => {
    expect(getRouteCoordinateAtProgress(createRouteTimeline([]), 0.5)).toBeNull();
    expect(getRouteCoordinateAtProgress(createRouteTimeline([location(37.6, 55.7)]), 0.5)).toEqual([37.6, 55.7]);
  });

  it('places the marker at the route start, end, and clamped progress positions', () => {
    const timeline = createRouteTimeline([location(37.6, 55.7), location(37.8, 55.9)]);

    expect(getRouteCoordinateAtProgress(timeline, -1)).toEqual([37.6, 55.7]);
    expect(getRouteCoordinateAtProgress(timeline, 0)).toEqual([37.6, 55.7]);
    expect(getRouteCoordinateAtProgress(timeline, 1)).toEqual([37.8, 55.9]);
    expect(getRouteCoordinateAtProgress(timeline, 2)).toEqual([37.8, 55.9]);
  });

  it('interpolates by traveled distance across segments rather than point index', () => {
    const timeline = createRouteTimeline([location(0, 0), location(0.002, 0), location(0.002, 0.001)]);
    const coordinate = getRouteCoordinateAtProgress(timeline, 0.75);

    expect(coordinate?.[0]).toBeCloseTo(0.002, 6);
    expect(coordinate?.[1]).toBeCloseTo(0.00025, 6);
  });

  it('handles repeated route points without producing invalid coordinates', () => {
    const timeline = createRouteTimeline([location(37.6, 55.7), location(37.6, 55.7), location(37.6, 55.7)]);

    expect(timeline.totalDistance).toBe(0);
    expect(getRouteCoordinateAtProgress(timeline, 0.8)).toEqual([37.6, 55.7]);
  });

  it('smooths camera turns across north using the short angle path', () => {
    const nextHeading = smoothRouteHeading(359, 1, 16);

    expect(nextHeading).toBeGreaterThan(359);
    expect(nextHeading).toBeLessThan(360);
  });
});
