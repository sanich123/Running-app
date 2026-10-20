import { LANGUAGES, type LANGUAGES as Language } from '@const/enums';
import { isRunningActivity } from '@U/location/location-utils';
import type {
  ActivityChartMetric,
  ActivityChartPoint,
  ActivityChartSeries,
  HeartRateZone,
  HeartRateZoneSettings,
} from './types';
import type { ActivityChartDataResponse } from '@R/runich-api/types';
import type { ActivityHeartRateSample } from '@S/card/types';

type ActivityChartLocation = NonNullable<ActivityChartDataResponse['locations']>[number];

interface ValuePoint {
  position: number;
  value: number;
}

interface TimedRoutePoint {
  latitude?: number;
  longitude?: number;
  timestamp: number;
  altitude?: number;
  speed?: number;
}

interface RouteCoordinates {
  latitude: number;
  longitude: number;
}

const CHART_POINT_COUNT = 81;
const MINIMUM_PACE_SPEED_KILOMETRES_PER_HOUR = 1.5;
const MAXIMUM_ROUTE_SPEED_KILOMETRES_PER_HOUR = 126;
const CHART_TICK_INDICES = new Set([0, 27, 54, CHART_POINT_COUNT - 1]);

export const HEART_RATE_ZONE_COLORS = ['#58BCEB', '#42C477', '#F2C94C', '#F2994A', '#EB5757'] as const;

export const ACTIVITY_CHART_METRIC_COLORS: Record<ActivityChartMetric, string> = {
  heartRate: HEART_RATE_ZONE_COLORS[0],
  pace: '#2563EB',
  speed: '#0F766E',
  elevation: '#7C3AED',
};

function getTimestamp(location: ActivityChartLocation) {
  const timestamp = location.timestamp ?? location.coords.timestamp;
  return typeof timestamp === 'number' && Number.isFinite(timestamp) && timestamp > 0 ? timestamp : undefined;
}

function getRouteCoordinates(point: TimedRoutePoint): RouteCoordinates | undefined {
  if (
    typeof point.latitude !== 'number' ||
    typeof point.longitude !== 'number' ||
    !Number.isFinite(point.latitude) ||
    !Number.isFinite(point.longitude)
  ) {
    return undefined;
  }
  return { latitude: point.latitude, longitude: point.longitude };
}

function getDistanceBetweenPoints(first: RouteCoordinates, second: RouteCoordinates) {
  const earthRadiusMeters = 6_371_000;
  const latitudeDifference = ((second.latitude - first.latitude) * Math.PI) / 180;
  const longitudeDifference = ((second.longitude - first.longitude) * Math.PI) / 180;
  const firstLatitude = (first.latitude * Math.PI) / 180;
  const secondLatitude = (second.latitude * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDifference / 2) ** 2;
  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(Math.min(1, haversine)));
}

function interpolate(points: ValuePoint[], position: number): number | undefined {
  if (!points.length) return undefined;
  if (position <= points[0].position) return points[0].value;

  for (let index = 1; index < points.length; index += 1) {
    const right = points[index];
    if (position > right.position) continue;
    const left = points[index - 1];
    const span = right.position - left.position;
    if (span <= 0) return right.value;
    const fraction = (position - left.position) / span;
    return left.value + (right.value - left.value) * fraction;
  }

  return points[points.length - 1].value;
}

function formatElapsedTime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function createSeries(
  metric: ActivityChartMetric,
  values: (number | undefined)[],
  elapsedTimes: number[],
): ActivityChartSeries | undefined {
  const availableValues = values.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value),
  );
  if (availableValues.length < 2) return undefined;

  return {
    metric,
    minValue: Math.min(...availableValues),
    maxValue: Math.max(...availableValues),
    data: values.map((value, index): ActivityChartPoint => ({
      originalValue: typeof value === 'number' && Number.isFinite(value) ? value : Number.NaN,
      elapsedMilliseconds: elapsedTimes[index],
      ...(CHART_TICK_INDICES.has(index) ? { label: formatElapsedTime(elapsedTimes[index]) } : {}),
    })),
  };
}

export function buildActivityChartSeries(
  response: ActivityChartDataResponse,
  sport: string,
  activityDistance: number,
): ActivityChartSeries[] {
  const locations = response.locations ?? [];
  if (locations.length < 2) return [];

  const timedRoute = locations
    .flatMap((location): TimedRoutePoint[] => {
      const { latitude, longitude, altitude } = location.coords;
      const timestamp = getTimestamp(location);
      const speed = location.coords.speed;
      return timestamp !== undefined
        ? [
            {
              timestamp,
              ...(typeof latitude === 'number' && Number.isFinite(latitude) ? { latitude } : {}),
              ...(typeof longitude === 'number' && Number.isFinite(longitude) ? { longitude } : {}),
              ...(typeof altitude === 'number' && Number.isFinite(altitude) ? { altitude } : {}),
              ...(typeof speed === 'number' && Number.isFinite(speed) ? { speed } : {}),
            },
          ]
        : [];
    })
    .sort((first, second) => first.timestamp - second.timestamp);
  if (timedRoute.length < 2) return [];

  const startedAt = timedRoute[0].timestamp;
  const elapsedDuration = timedRoute[timedRoute.length - 1].timestamp - startedAt;
  if (elapsedDuration <= 0) return [];
  const routeDistance = timedRoute.reduce((distance, point, index) => {
    const previous = timedRoute[index - 1];
    if (!previous) return distance;
    const previousCoordinates = getRouteCoordinates(previous);
    const pointCoordinates = getRouteCoordinates(point);
    return previousCoordinates && pointCoordinates
      ? distance + getDistanceBetweenPoints(previousCoordinates, pointCoordinates)
      : distance;
  }, 0);
  const distanceScale = activityDistance > 0 && routeDistance > 0 ? activityDistance / routeDistance : 1;

  const heartRateByTime = response.heartRateSamples
    .filter(
      (sample: ActivityHeartRateSample) =>
        Number.isFinite(sample.timestamp) &&
        Number.isFinite(sample.beatsPerMinute) &&
        sample.beatsPerMinute >= 1 &&
        sample.beatsPerMinute <= 300 &&
        sample.timestamp >= startedAt &&
        sample.timestamp <= startedAt + elapsedDuration,
    )
    .map((sample) => ({ position: sample.timestamp - startedAt, value: sample.beatsPerMinute }))
    .sort((first, second) => first.position - second.position);
  const elapsedTimes = Array.from(
    { length: CHART_POINT_COUNT },
    (_, index) => (elapsedDuration * index) / (CHART_POINT_COUNT - 1),
  );
  const series: ActivityChartSeries[] = [];
  if (heartRateByTime.length >= 2) {
    const heartRateSeries = createSeries(
      'heartRate',
      elapsedTimes.map((elapsedTime) => interpolate(heartRateByTime, elapsedTime)),
      elapsedTimes,
    );
    if (heartRateSeries) series.push(heartRateSeries);
  }

  const paceOrSpeedMetric = isRunningActivity(sport) ? 'pace' : 'speed';
  const paceOrSpeedSamples: ValuePoint[] = [];
  timedRoute.forEach((point, index) => {
    let speedKilometresPerHour = point.speed;
    let position = point.timestamp - startedAt;
    if (typeof speedKilometresPerHour !== 'number') {
      const previous = timedRoute[index - 1];
      if (!previous) return;
      const previousCoordinates = getRouteCoordinates(previous);
      const pointCoordinates = getRouteCoordinates(point);
      if (!previousCoordinates || !pointCoordinates) return;
      const elapsedSeconds = (point.timestamp - previous.timestamp) / 1000;
      const segmentDistance = getDistanceBetweenPoints(previousCoordinates, pointCoordinates) * distanceScale;
      if (elapsedSeconds <= 0 || segmentDistance <= 0) return;
      speedKilometresPerHour = (segmentDistance / elapsedSeconds) * 3.6;
      position = (point.timestamp + previous.timestamp) / 2 - startedAt;
    }
    if (
      (paceOrSpeedMetric === 'pace' && speedKilometresPerHour < MINIMUM_PACE_SPEED_KILOMETRES_PER_HOUR) ||
      speedKilometresPerHour < 0.5 ||
      speedKilometresPerHour > MAXIMUM_ROUTE_SPEED_KILOMETRES_PER_HOUR
    ) {
      return;
    }
    paceOrSpeedSamples.push({
      position,
      value: paceOrSpeedMetric === 'pace' ? 3600 / speedKilometresPerHour : speedKilometresPerHour,
    });
  });

  if (paceOrSpeedSamples.length >= 2) {
    const paceOrSpeedSeries = createSeries(
      paceOrSpeedMetric,
      elapsedTimes.map((elapsedTime) => interpolate(paceOrSpeedSamples, elapsedTime)),
      elapsedTimes,
    );
    if (paceOrSpeedSeries) series.push(paceOrSpeedSeries);
  }

  const elevationByTime = timedRoute
    .filter((point): point is TimedRoutePoint & { altitude: number } => typeof point.altitude === 'number')
    .map((point) => ({ position: point.timestamp - startedAt, value: point.altitude }))
    .sort((first, second) => first.position - second.position);
  if (elevationByTime.length >= 2) {
    const elevationSeries = createSeries(
      'elevation',
      elapsedTimes.map((elapsedTime) => interpolate(elevationByTime, elapsedTime)),
      elapsedTimes,
    );
    if (elevationSeries) series.push(elevationSeries);
  }

  return series;
}

export function getHeartRateZoneSettings({
  activityMaximumHeartRate,
  profileAge,
  profileMaximumHeartRate,
  profileRestingHeartRate,
}: {
  activityMaximumHeartRate: number;
  profileAge?: string | number | null;
  profileMaximumHeartRate?: string | number | null;
  profileRestingHeartRate?: string | number | null;
}): HeartRateZoneSettings {
  const restingHeartRate = Number(profileRestingHeartRate);
  const maximumHeartRate = Number(profileMaximumHeartRate);
  if (
    Number.isInteger(restingHeartRate) &&
    restingHeartRate >= 30 &&
    restingHeartRate <= 200 &&
    Number.isInteger(maximumHeartRate) &&
    maximumHeartRate > restingHeartRate &&
    maximumHeartRate <= 250
  ) {
    return { basis: 'heartRateReserve', maximumHeartRate, restingHeartRate };
  }

  const age = Number(profileAge);
  if (Number.isInteger(age) && age >= 13 && age <= 100) {
    return { basis: 'age', maximumHeartRate: Math.round(208 - 0.7 * age) };
  }

  return {
    basis: 'activityMaximum',
    maximumHeartRate:
      Number.isFinite(activityMaximumHeartRate) && activityMaximumHeartRate > 0 ? activityMaximumHeartRate : 0,
  };
}

export function getHeartRateZone(value: number, settings: HeartRateZoneSettings): HeartRateZone {
  const percentage =
    settings.basis === 'heartRateReserve' && settings.restingHeartRate !== undefined
      ? (value - settings.restingHeartRate) / (settings.maximumHeartRate - settings.restingHeartRate)
      : value / settings.maximumHeartRate;
  if (percentage >= 0.9) return 5;
  if (percentage >= 0.8) return 4;
  if (percentage >= 0.7) return 3;
  if (percentage >= 0.6) return 2;
  return 1;
}

export function formatHeartRateZoneRange(zone: HeartRateZone, settings: HeartRateZoneSettings): string {
  if (!Number.isFinite(settings.maximumHeartRate) || settings.maximumHeartRate <= 0) {
    return '—';
  }

  const thresholds = [0.6, 0.7, 0.8, 0.9];
  const restingHeartRate = settings.basis === 'heartRateReserve' ? settings.restingHeartRate : 0;
  const heartRateReserve = settings.maximumHeartRate - restingHeartRate;
  const minimum = zone === 1 ? undefined : Math.ceil(restingHeartRate + heartRateReserve * thresholds[zone - 2]);
  const maximum = zone === 5 ? undefined : Math.ceil(restingHeartRate + heartRateReserve * thresholds[zone - 1]) - 1;

  if (minimum === undefined) return `≤ ${maximum}`;
  if (maximum === undefined) return `≥ ${minimum}`;
  return `${minimum}–${maximum}`;
}

export function buildHeartRateZoneDistribution(series: ActivityChartSeries, settings: HeartRateZoneSettings) {
  const heartRatePoints = series.data.filter((point) => Number.isFinite(point.originalValue));
  const maximumFromChart = Math.max(...heartRatePoints.map(({ originalValue }) => originalValue));
  const resolvedSettings =
    settings.basis === 'activityMaximum'
      ? { ...settings, maximumHeartRate: Math.max(maximumFromChart, settings.maximumHeartRate) }
      : settings;
  const zoneDurations = [0, 0, 0, 0, 0];

  for (let index = 1; index < heartRatePoints.length; index += 1) {
    const previous = heartRatePoints[index - 1];
    const current = heartRatePoints[index];
    const intervalDuration = current.elapsedMilliseconds - previous.elapsedMilliseconds;
    if (intervalDuration <= 0) continue;
    const averageHeartRate = (previous.originalValue + current.originalValue) / 2;
    zoneDurations[getHeartRateZone(averageHeartRate, resolvedSettings) - 1] += intervalDuration;
  }

  const totalDuration = zoneDurations.reduce((duration, zoneDuration) => duration + zoneDuration, 0);
  const zones = zoneDurations.map((duration, index) => ({
    zone: (index + 1) as HeartRateZone,
    duration,
    percentage: totalDuration > 0 ? (duration / totalDuration) * 100 : 0,
  }));
  if (totalDuration > 0) {
    const roundedPercentages = zones.map(({ percentage }) => Math.round(percentage));
    const largestZoneIndex = zones.reduce(
      (largestIndex, zone, index) => (zone.duration > zones[largestIndex].duration ? index : largestIndex),
      0,
    );
    roundedPercentages[largestZoneIndex] +=
      100 - roundedPercentages.reduce((total, percentage) => total + percentage, 0);
    return zones.map((zone, index) => ({ ...zone, percentage: roundedPercentages[index] }));
  }

  return zones;
}

export function getActivityChartAxisTicks(series: ActivityChartSeries, metric: ActivityChartMetric) {
  if (metric === 'heartRate') {
    const maximum = Math.max(series.minValue, series.maxValue);
    const minimum = Math.min(series.minValue, series.maxValue);
    const span = maximum - minimum || 4;
    return Array.from({ length: 5 }, (_, index) => Math.round(maximum - (span * index) / 4));
  }

  const minimum = Math.min(series.minValue, series.maxValue);
  const maximum = Math.max(series.minValue, series.maxValue);
  const span = maximum - minimum || 1;
  return Array.from({ length: 5 }, (_, index) =>
    metric === 'pace' ? minimum + (span * index) / 4 : maximum - (span * index) / 4,
  );
}

export function getDefaultActivityChartAxes(series: ActivityChartSeries[]) {
  const leftMetric = series.find(({ metric }) => metric === 'heartRate')?.metric ?? series[0]?.metric;
  const rightMetric =
    series.find(({ metric }) => metric !== leftMetric && (metric === 'pace' || metric === 'speed'))?.metric ??
    series.find(({ metric }) => metric !== leftMetric)?.metric ??
    leftMetric;

  return { leftMetric, rightMetric };
}

export function getActivityChartYCoordinate(
  value: number,
  metric: ActivityChartMetric,
  minimum: number,
  maximum: number,
  top: number,
  height: number,
) {
  const fraction = (value - minimum) / (maximum - minimum || 1);
  return top + (metric === 'pace' ? fraction : 1 - fraction) * height;
}

export function getActivityChartXCoordinate(index: number, pointCount: number, plotWidth: number, left: number) {
  return left + (plotWidth * index) / Math.max(1, pointCount - 1);
}

export function buildActivityChartPath(
  series: ActivityChartSeries,
  minimum: number,
  maximum: number,
  plotWidth: number,
  plotHeight: number,
  left: number,
  top: number,
) {
  return series.data
    .map(({ originalValue }, index) => {
      const x = getActivityChartXCoordinate(index, series.data.length, plotWidth, left);
      const y = getActivityChartYCoordinate(originalValue, series.metric, minimum, maximum, top, plotHeight);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

function formatPace(value: number) {
  const totalSeconds = Math.round(value);
  return `${Math.floor(totalSeconds / 60)}'${String(totalSeconds % 60).padStart(2, '0')}`;
}

export function formatActivityChartAxisValue(metric: ActivityChartMetric, value: number, language: Language) {
  if (metric === 'heartRate') return String(Math.round(value));
  if (metric === 'pace') return formatPace(value);
  return new Intl.NumberFormat(language === LANGUAGES.russian ? 'ru-RU' : 'en-US', {
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatHeartRateZoneDuration(milliseconds: number) {
  return formatElapsedTime(milliseconds);
}
