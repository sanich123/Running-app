/* global process, console, setTimeout */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';

const DEFAULT_ROUTE = resolve('scripts/routes/runich-moscow.gpx');
const args = process.argv.slice(2);

function getArg(name, fallback) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
}

const routePath = resolve(getArg('--route', DEFAULT_ROUTE));
const interval = Number(getArg('--interval', '100'));
const requestedPointCount = Number(getArg('--points', '5000'));
const speedArgument = getArg('--speed', null);
const speedMetersPerSecond = speedArgument === null ? null : Number(speedArgument);
const serial = getArg('--device', process.env.ANDROID_SERIAL);

if (!Number.isFinite(interval) || interval < 50) {
  throw new Error('--interval must be a number of milliseconds greater than or equal to 50');
}

if (!Number.isInteger(requestedPointCount) || requestedPointCount < 2) {
  throw new Error('--points must be an integer greater than or equal to 2');
}

if (speedMetersPerSecond !== null && (!Number.isFinite(speedMetersPerSecond) || speedMetersPerSecond <= 0)) {
  throw new Error('--speed must be a positive number of meters per second');
}

const devicesOutput = execFileSync('adb', ['devices'], { encoding: 'utf8' });
const devices = devicesOutput
  .split('\n')
  .slice(1)
  .map((line) => line.trim().split(/\s+/))
  .filter(([device, state]) => device && state === 'device')
  .map(([device]) => device);

if (!devices.length) {
  throw new Error('No online Android emulator found. Start an emulator first.');
}

if (!serial && devices.length > 1) {
  throw new Error(`More than one Android device is online. Use --device ${devices[0]} or set ANDROID_SERIAL.`);
}

const device = serial || devices[0];
const routeBuffer = readFileSync(routePath);
const routeContents =
  routeBuffer[0] === 0x1f && routeBuffer[1] === 0x8b
    ? gunzipSync(routeBuffer).toString('utf8')
    : routeBuffer.toString('utf8');
const routePoints = routeContents.trimStart().startsWith('{')
  ? (JSON.parse(routeContents).locations ?? []).map((location) => {
      if (Array.isArray(location)) {
        return { latitude: Number(location[0]), longitude: Number(location[1]) };
      }
      return {
        latitude: Number(location.coords?.latitude),
        longitude: Number(location.coords?.longitude),
      };
    })
  : [...routeContents.matchAll(/<(?:wpt|rtept|trkpt)\b([^>]*)>/g)].map((match) => {
      const latitude = match[1].match(/\blat="([\d.-]+)"/);
      const longitude = match[1].match(/\blon="([\d.-]+)"/);
      return { latitude: Number(latitude?.[1]), longitude: Number(longitude?.[1]) };
    });

const validRoutePoints = routePoints.filter(
  ({ latitude, longitude }) =>
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180,
);

if (validRoutePoints.length < 2) {
  throw new Error(`Route ${routePath} must contain at least two valid GPX or JSON location points.`);
}

const points = Array.from({ length: requestedPointCount }, (_, index) => {
  const progress = index / (requestedPointCount - 1);
  const routePosition = progress * (validRoutePoints.length - 1);
  const segmentIndex = Math.min(Math.floor(routePosition), validRoutePoints.length - 2);
  const segmentProgress = routePosition - segmentIndex;
  const start = validRoutePoints[segmentIndex];
  const end = validRoutePoints[segmentIndex + 1];

  return {
    latitude: start.latitude + (end.latitude - start.latitude) * segmentProgress,
    longitude: start.longitude + (end.longitude - start.longitude) * segmentProgress,
  };
});

const playbackDescription = speedMetersPerSecond ? `at ${speedMetersPerSecond} m/s` : `every ${interval} ms`;
console.log(
  `Playing ${points.length} location points from ${validRoutePoints.length} route points on ${device} ${playbackDescription}`,
);

const wait = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));
const getDistanceMeters = (start, end) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(end.latitude - start.latitude);
  const longitudeDelta = toRadians(end.longitude - start.longitude);
  const startLatitude = toRadians(start.latitude);
  const endLatitude = toRadians(end.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * 6_371_000 * Math.asin(Math.sqrt(haversine));
};

for (const [index, point] of points.entries()) {
  execFileSync('adb', ['-s', device, 'emu', 'geo', 'fix', String(point.longitude), String(point.latitude)], {
    stdio: 'ignore',
  });
  if (index === 0 || index === points.length - 1 || (index + 1) % 100 === 0) {
    console.log(`${index + 1}/${points.length}`);
  }
  if (index < points.length - 1) {
    const nextInterval = speedMetersPerSecond
      ? (getDistanceMeters(point, points[index + 1]) / speedMetersPerSecond) * 1000
      : interval;
    await wait(nextInterval);
  }
}

console.log('Route playback finished.');
