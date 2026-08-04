import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_ROUTE = resolve('scripts/routes/runich-moscow.gpx');
const args = process.argv.slice(2);

function getArg(name, fallback) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
}

const routePath = resolve(getArg('--route', DEFAULT_ROUTE));
const interval = Number(getArg('--interval', '100'));
const requestedPointCount = Number(getArg('--points', '3000'));
const serial = getArg('--device', process.env.ANDROID_SERIAL);

if (!Number.isFinite(interval) || interval < 50) {
  throw new Error('--interval must be a number of milliseconds greater than or equal to 50');
}

if (!Number.isInteger(requestedPointCount) || requestedPointCount < 2) {
  throw new Error('--points must be an integer greater than or equal to 2');
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
const gpx = readFileSync(routePath, 'utf8');
const routePoints = [...gpx.matchAll(/<trkpt\s+lat="([\d.-]+)"\s+lon="([\d.-]+)"/g)].map((match) => ({
  latitude: Number(match[1]),
  longitude: Number(match[2]),
}));

if (routePoints.length < 2) {
  throw new Error(`Route ${routePath} must contain at least two GPX track points.`);
}

const points = Array.from({ length: requestedPointCount }, (_, index) => {
  const progress = index / (requestedPointCount - 1);
  const routePosition = progress * (routePoints.length - 1);
  const segmentIndex = Math.min(Math.floor(routePosition), routePoints.length - 2);
  const segmentProgress = routePosition - segmentIndex;
  const start = routePoints[segmentIndex];
  const end = routePoints[segmentIndex + 1];

  return {
    latitude: start.latitude + (end.latitude - start.latitude) * segmentProgress,
    longitude: start.longitude + (end.longitude - start.longitude) * segmentProgress,
  };
});

console.log(`Playing ${points.length} location points on ${device} every ${interval} ms`);

const wait = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));

for (const [index, point] of points.entries()) {
  execFileSync('adb', ['-s', device, 'emu', 'geo', 'fix', String(point.longitude), String(point.latitude)], {
    stdio: 'ignore',
  });
  if (index === 0 || index === points.length - 1 || (index + 1) % 100 === 0) {
    console.log(`${index + 1}/${points.length}: ${point.latitude}, ${point.longitude}`);
  }
  if (index < points.length - 1) {
    await wait(interval);
  }
}

console.log('Route playback finished.');
