import {
  createRouteTimeline,
  getRouteCoordinateAtPlaybackProgress,
  getRouteCoordinateAtProgress,
  getRouteHeadingAtProgress,
  getRouteSpeedAtPlaybackProgress,
  smoothRouteHeading,
} from './utils';
import type { RouteTimeline } from './types';
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

  it('keeps camera heading safe for routes that close back at their start', () => {
    const closedRoute: RouteTimeline = {
      coordinates: [
        [0, 0],
        [1, 1],
        [0, 0],
      ],
      cumulativeDistances: [0, 1, 2],
      totalDistance: 2,
      cumulativePlaybackTimes: [],
      totalPlaybackTime: 0,
      segmentSpeeds: [null, null],
      segmentColors: [],
    };
    const missingPlaybackSamples = { ...closedRoute, totalPlaybackTime: 1 };

    expect(getRouteCoordinateAtPlaybackProgress(missingPlaybackSamples, 0.5)).toEqual([0, 0]);
    expect(getRouteSpeedAtPlaybackProgress(missingPlaybackSamples, 0.5)).toBeNull();
    expect(getRouteHeadingAtProgress(closedRoute, 1)).toBe(0);
    expect(getRouteHeadingAtProgress(missingPlaybackSamples, 0.5)).toBe(0);
  });

  it('smooths camera turns across north using the short angle path', () => {
    const nextHeading = smoothRouteHeading(359, 1, 16);

    expect(nextHeading).toBeGreaterThan(359);
    expect(nextHeading).toBeLessThan(360);
  });

  it('builds playback time from timestamps, recorded speeds, and distance fallbacks', () => {
    const timestampTimeline = createRouteTimeline([
      { timestamp: 1_000, ...location(0, 0) },
      { timestamp: 2_000, ...location(0.001, 0) },
    ]);
    expect(timestampTimeline.totalPlaybackTime).toBe(1);

    const speedTimeline = createRouteTimeline([
      { coords: { longitude: 0, latitude: 0, speed: 2 } },
      { coords: { longitude: 0.001, latitude: 0, speed: 4 } },
    ]);
    expect(speedTimeline.segmentSpeeds).toEqual([3]);
    expect(speedTimeline.totalPlaybackTime).toBeGreaterThan(0);

    const distanceTimeline = createRouteTimeline([location(0, 0), location(0.001, 0)]);
    expect(distanceTimeline.segmentSpeeds).toEqual([null]);
    expect(distanceTimeline.totalPlaybackTime).toBeGreaterThan(0);
  });

  it('uses coordinate timestamps and valid recorded speeds when timestamps cannot define playback time', () => {
    const coordinateTimestampTimeline = createRouteTimeline([
      { coords: { longitude: 0, latitude: 0, timestamp: 1_000, speed: 2 } },
      { coords: { longitude: 0.001, latitude: 0, timestamp: 1_000 } },
    ]);
    expect(coordinateTimestampTimeline.totalPlaybackTime).toBeGreaterThan(0);

    const invalidTimestampTimeline = createRouteTimeline([
      { timestamp: Number.NaN, ...location(0, 0) },
      { timestamp: 500, ...location(0.001, 0) },
    ]);
    expect(invalidTimestampTimeline.totalPlaybackTime).toBeCloseTo(invalidTimestampTimeline.totalDistance);
  });

  it('handles zero-length segments and missing speed values at playback boundaries', () => {
    const timeline = createRouteTimeline([location(0, 0), location(0, 0), location(0.001, 0)]);
    expect(getRouteCoordinateAtProgress(timeline, 0)).toEqual([0, 0]);
    expect(getRouteCoordinateAtPlaybackProgress(timeline, 0)).toEqual([0, 0]);
    expect(getRouteSpeedAtPlaybackProgress(timeline, 0)).toBeNull();

    timeline.segmentSpeeds = [null, 4];
    expect(getRouteSpeedAtPlaybackProgress(timeline, 0)).toBe(4);
    timeline.segmentSpeeds = [2, 4];
    expect(getRouteSpeedAtPlaybackProgress(timeline, 1)).toBe(4);
  });

  it('interpolates playback positions and speeds across recorded route segments', () => {
    const timeline = createRouteTimeline([
      { timestamp: 0, ...location(0, 0) },
      { timestamp: 1_000, ...location(0.001, 0) },
      { timestamp: 3_000, ...location(0.001, 0.002) },
    ]);

    expect(getRouteCoordinateAtPlaybackProgress(timeline, 0.25)?.[0]).toBeCloseTo(0.00075, 6);
    expect(getRouteCoordinateAtPlaybackProgress(timeline, 0.5)?.[1]).toBeCloseTo(0.0005, 6);
    expect(getRouteSpeedAtPlaybackProgress(timeline, 0.25)).not.toBeNull();
    expect(getRouteSpeedAtPlaybackProgress(timeline, 0.75)).not.toBeNull();
    expect(getRouteSpeedAtPlaybackProgress(createRouteTimeline([]), 0.5)).toBeNull();
  });

  it('handles empty, stationary, and clamped routes when calculating heading and playback speed', () => {
    const stationaryRoute = createRouteTimeline([location(1, 1), location(1, 1)]);
    const emptyRoute = createRouteTimeline([]);

    expect(getRouteCoordinateAtPlaybackProgress(emptyRoute, 0.5)).toBeNull();
    expect(getRouteCoordinateAtPlaybackProgress(stationaryRoute, 0.5)).toEqual([1, 1]);
    expect(getRouteSpeedAtPlaybackProgress(stationaryRoute, 0.5)).toBeNull();
    expect(getRouteHeadingAtProgress(emptyRoute, 0.5)).toBe(0);
    expect(getRouteHeadingAtProgress(stationaryRoute, 0.5)).toBe(0);
    expect(getRouteHeadingAtProgress(createRouteTimeline([location(0, 0), location(0, 0.01)]), -1)).toBe(0);
    expect(smoothRouteHeading(10, 350, -10)).toBeCloseTo(10, 1);
  });
});
