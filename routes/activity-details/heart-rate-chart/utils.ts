import { LANGUAGES, type LANGUAGES as Language } from '@const/enums';
import { isRunningActivity } from '@U/location/location-utils';
import { HOME_ACTIVITY_FULL_VIEW } from '../metrics/const';
import type { HeartRateChartMetric, HeartRateChartPoint, HeartRateChartSeries } from './types';
import type { ActivityChartDataResponse } from '@R/runich-api/types';
import type { ActivityHeartRateSample, ActivityLocation } from '@S/card/types';

interface ValuePoint {
  position: number;
  value: number;
}

interface RoutePoint {
  latitude: number;
  longitude: number;
  distance: number;
  timestamp?: number;
  altitude?: number;
}

const CHART_POINT_COUNT = 81;
const CHART_TICK_INDICES = new Set([0, 27, 54, CHART_POINT_COUNT - 1]);

function getTimestamp(location: ActivityLocation) {
  const timestamp = location.timestamp ?? location.coords.timestamp;
  return typeof timestamp === 'number' && Number.isFinite(timestamp) && timestamp > 0 ? timestamp : undefined;
}

function getAltitude(location: ActivityLocation) {
  const altitude = location.coords.altitude;
  return typeof altitude === 'number' && Number.isFinite(altitude) ? altitude : undefined;
}

function getDistanceBetweenPoints(first: RoutePoint, second: ActivityLocation['coords']) {
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

function normalizeSeries(
  metric: HeartRateChartMetric,
  points: (number | undefined)[],
  labels: (string | undefined)[],
): HeartRateChartSeries | undefined {
  const availableValues = points.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value),
  );
  if (availableValues.length < 2) return undefined;

  const minValue = Math.min(...availableValues);
  const maxValue = Math.max(...availableValues);
  const span = maxValue - minValue;
  return {
    metric,
    minValue,
    maxValue,
    data: points.flatMap((value, index): HeartRateChartPoint[] =>
      typeof value === 'number' && Number.isFinite(value)
        ? [
            {
              value: span === 0 ? 50 : ((value - minValue) / span) * 100,
              originalValue: value,
              ...(labels[index] ? { label: labels[index] } : {}),
            },
          ]
        : [],
    ),
  };
}

export function buildHeartRateChartSeries(
  response: ActivityChartDataResponse,
  sport: string,
  activityDistance: number,
): HeartRateChartSeries[] {
  const locations = response.locations ?? [];
  if (locations.length < 2 || !response.heartRateSamples.length) return [];

  const route: RoutePoint[] = [];
  let routeDistance = 0;

  locations.forEach((location) => {
    const { latitude, longitude } = location.coords;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    const previous = route[route.length - 1];
    if (previous) routeDistance += getDistanceBetweenPoints(previous, location.coords);
    route.push({
      latitude,
      longitude,
      distance: routeDistance,
      timestamp: getTimestamp(location),
      altitude: getAltitude(location),
    });
  });
  if (route.length < 2 || routeDistance <= 0) return [];

  const displayDistance = activityDistance > 0 ? activityDistance : routeDistance;
  const distanceScale = displayDistance / routeDistance;
  const timedRoute = route
    .filter((point): point is RoutePoint & { timestamp: number } => typeof point.timestamp === 'number')
    .sort((first, second) => first.timestamp - second.timestamp);
  if (timedRoute.length < 2) return [];

  const distanceAtTime = timedRoute.map((point) => ({ position: point.timestamp, value: point.distance }));
  const heartRateByDistance: ValuePoint[] = response.heartRateSamples
    .filter(
      (sample: ActivityHeartRateSample) =>
        Number.isFinite(sample.timestamp) &&
        Number.isFinite(sample.beatsPerMinute) &&
        sample.beatsPerMinute >= 1 &&
        sample.beatsPerMinute <= 300 &&
        sample.timestamp >= timedRoute[0].timestamp &&
        sample.timestamp <= timedRoute[timedRoute.length - 1].timestamp,
    )
    .map((sample) => {
      const routePosition = interpolate(distanceAtTime, sample.timestamp);
      return { position: (routePosition ?? 0) * distanceScale, value: sample.beatsPerMinute };
    })
    .sort((first, second) => first.position - second.position);

  if (heartRateByDistance.length < 2) return [];

  const labels = Array.from({ length: CHART_POINT_COUNT }, (_, index) =>
    CHART_TICK_INDICES.has(index) ? ((displayDistance * index) / (CHART_POINT_COUNT - 1) / 1000).toFixed(1) : undefined,
  );
  const targetDistances = Array.from(
    { length: CHART_POINT_COUNT },
    (_, index) => (displayDistance * index) / (CHART_POINT_COUNT - 1),
  );
  const series: HeartRateChartSeries[] = [];
  const heartRateSeries = normalizeSeries(
    'heartRate',
    targetDistances.map((distance) => interpolate(heartRateByDistance, distance)),
    labels,
  );
  if (heartRateSeries) series.push(heartRateSeries);

  const routeElevations = route
    .filter((point): point is RoutePoint & { altitude: number } => typeof point.altitude === 'number')
    .map((point) => ({ position: point.distance * distanceScale, value: point.altitude }));
  if (routeElevations.length >= 2) {
    const elevationSeries = normalizeSeries(
      'elevation',
      targetDistances.map((distance) => interpolate(routeElevations, distance)),
      Array.from({ length: CHART_POINT_COUNT }, () => undefined),
    );
    if (elevationSeries) series.push(elevationSeries);
  }

  const paceOrSpeedMetric = isRunningActivity(sport) ? 'pace' : 'speed';
  const speedSamples: ValuePoint[] = [];
  route.forEach((point, index) => {
    if (index === 0) return;
    const previous = route[index - 1];
    if (typeof point.timestamp !== 'number' || typeof previous.timestamp !== 'number') return;
    const elapsedSeconds = (point.timestamp - previous.timestamp) / 1000;
    const segmentDistance = (point.distance - previous.distance) * distanceScale;
    if (elapsedSeconds <= 0 || segmentDistance <= 0) return;
    const speedKilometresPerHour = (segmentDistance / elapsedSeconds) * 3.6;
    if (speedKilometresPerHour < 0.5 || speedKilometresPerHour > 126) return;
    speedSamples.push({
      position: ((point.distance + previous.distance) / 2) * distanceScale,
      value: paceOrSpeedMetric === 'pace' ? 3600 / speedKilometresPerHour : speedKilometresPerHour,
    });
  });
  if (speedSamples.length >= 2) {
    const paceOrSpeedSeries = normalizeSeries(
      paceOrSpeedMetric,
      targetDistances.map((distance) => interpolate(speedSamples, distance)),
      Array.from({ length: CHART_POINT_COUNT }, () => undefined),
    );
    if (paceOrSpeedSeries) series.splice(1, 0, paceOrSpeedSeries);
  }

  return series;
}

function formatPace(value: number) {
  const totalSeconds = Math.round(value);
  return Math.floor(totalSeconds / 60) + ':' + String(totalSeconds % 60).padStart(2, '0');
}

export function formatHeartRateChartMetric(metric: HeartRateChartMetric, value: number, language: Language) {
  const labels = HOME_ACTIVITY_FULL_VIEW[language];
  const number = new Intl.NumberFormat(language === LANGUAGES.russian ? 'ru-RU' : 'en-US', {
    maximumFractionDigits: 1,
  });
  if (metric === 'heartRate') return Math.round(value) + ' ' + labels.heartRateUnit;
  if (metric === 'pace') return formatPace(value) + ' /' + labels.km;
  if (metric === 'speed') return number.format(value) + ' ' + labels.kmh;
  return Math.round(value) + ' ' + labels.m;
}

export function getHeartRateChartMetricLabel(metric: HeartRateChartMetric, language: Language) {
  const labels = HOME_ACTIVITY_FULL_VIEW[language];
  if (metric === 'heartRate') return labels.heartRate;
  if (metric === 'pace') return labels.pace;
  if (metric === 'speed') return labels.speed;
  return labels.chartElevation;
}

export function formatHeartRateChartRange(series: HeartRateChartSeries, language: Language) {
  return (
    formatHeartRateChartMetric(series.metric, series.minValue, language) +
    '–' +
    formatHeartRateChartMetric(series.metric, series.maxValue, language)
  );
}
