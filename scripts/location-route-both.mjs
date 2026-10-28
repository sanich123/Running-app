/* global AbortSignal, Buffer, console, fetch, process */
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const androidPlayer = join(scriptDirectory, 'location-route.mjs');
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'runich-location-route-'));
const children = new Set();
let iosDeviceIds = [];
let stopping = false;
let interrupted = false;

function getOptions(args) {
  const options = { route: null, points: 5000, speed: 7.5, help: false };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--help' || argument === '-h') {
      options.help = true;
      continue;
    }
    if (argument === '--route') {
      options.route = args[index + 1];
      index += 1;
      continue;
    }
    if (argument === '--points') {
      options.points = Number(args[index + 1]);
      index += 1;
      continue;
    }
    if (argument === '--speed') {
      options.speed = Number(args[index + 1]);
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${argument}. Use --help to see usage.`);
  }

  if (options.route !== null && !options.route) throw new Error('--route requires a file path or URL.');
  if (!Number.isInteger(options.points) || options.points < 2) {
    throw new Error('--points must be an integer greater than or equal to 2.');
  }
  if (!Number.isFinite(options.speed) || options.speed <= 0) {
    throw new Error('--speed must be a positive number of meters per second.');
  }

  return options;
}

function getAndroidEmulators() {
  const output = execFileSync('adb', ['devices', '-l'], { encoding: 'utf8' });
  return output
    .split('\n')
    .slice(1)
    .map((line) => line.trim().split(/\s+/))
    .filter(([serial, state]) => serial?.startsWith('emulator-') && state === 'device')
    .map(([serial]) => serial);
}

function getBootedIosSimulators() {
  const output = execFileSync('xcrun', ['simctl', 'list', 'devices', '--json'], { encoding: 'utf8' });
  const deviceGroups = JSON.parse(output).devices ?? {};
  return Object.values(deviceGroups)
    .flat()
    .filter((device) => device.state === 'Booted' && device.udid)
    .map(({ name, udid }) => ({ name, udid }));
}

function findLatestDownloadedRoute() {
  const downloadsDirectory = join(homedir(), 'Downloads');
  if (!existsSync(downloadsDirectory)) throw new Error(`Downloads folder was not found: ${downloadsDirectory}`);

  const routes = readdirSync(downloadsDirectory)
    .filter((name) => /^locations-v1(?: \(\d+\))?\.json\.gz$/i.test(name))
    .map((name) => {
      const path = join(downloadsDirectory, name);
      return { path, modifiedAt: statSync(path).mtimeMs };
    })
    .sort((left, right) => right.modifiedAt - left.modifiedAt);

  if (!routes.length) {
    throw new Error(
      `No downloaded locations-v1*.json.gz route found in ${downloadsDirectory}. Pass --route <path|https-url|s3://bucket/key>.`,
    );
  }

  return routes[0].path;
}

async function downloadRoute(source) {
  const routeName = `route-${Date.now()}.json.gz`;
  const targetPath = join(temporaryDirectory, routeName);

  if (source.startsWith('https://')) {
    const response = await fetch(source, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`Route download failed with HTTP ${response.status}.`);
    const routeContents = Buffer.from(await response.arrayBuffer());
    if (routeContents.length > 50 * 1024 * 1024) throw new Error('Route file exceeds the 50 MB limit.');
    writeFileSync(targetPath, routeContents);
    return targetPath;
  }

  if (source.startsWith('s3://')) {
    const result = spawnSync('aws', ['s3', 'cp', source, targetPath], { stdio: 'ignore' });
    if (result.error?.code === 'ENOENT') {
      throw new Error('Downloading an s3:// route requires AWS CLI. Use its HTTPS S3/CDN URL or a local route file.');
    }
    if (result.status !== 0)
      throw new Error('S3 route download failed. Check AWS CLI credentials and the object path.');
    return targetPath;
  }

  if (/^[a-z][a-z\d+.-]*:\/\//i.test(source)) {
    throw new Error('Only HTTPS URLs, s3:// object paths, and local route files are supported.');
  }

  const localPath = resolve(source.startsWith('~/') ? join(homedir(), source.slice(2)) : source);
  if (!existsSync(localPath)) throw new Error(`Route file was not found: ${localPath}`);
  return localPath;
}

function decodeRoute(routePath) {
  const file = readFileSync(routePath);
  const contents = file[0] === 0x1f && file[1] === 0x8b ? gunzipSync(file).toString('utf8') : file.toString('utf8');
  const trimmedContents = contents.trimStart();

  const points =
    trimmedContents.startsWith('{') || trimmedContents.startsWith('[')
      ? (() => {
          const parsed = JSON.parse(contents);
          const locations = Array.isArray(parsed) ? parsed : parsed.locations;
          if (!Array.isArray(locations)) throw new Error('Route JSON must contain a locations array.');
          return locations.map((location) => {
            if (Array.isArray(location)) {
              return { latitude: Number(location[0]), longitude: Number(location[1]) };
            }
            return {
              latitude: Number(location.coords?.latitude ?? location.latitude),
              longitude: Number(location.coords?.longitude ?? location.longitude),
            };
          });
        })()
      : [...contents.matchAll(/<(?:wpt|rtept|trkpt)\b([^>]*)>/g)].map((match) => {
          const latitude = match[1].match(/\blat="([\d.-]+)"/);
          const longitude = match[1].match(/\blon="([\d.-]+)"/);
          return { latitude: Number(latitude?.[1]), longitude: Number(longitude?.[1]) };
        });

  const validPoints = points.filter(
    ({ latitude, longitude }) =>
      Number.isFinite(latitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      Number.isFinite(longitude) &&
      longitude >= -180 &&
      longitude <= 180,
  );

  if (validPoints.length < 2) throw new Error('Route must contain at least two valid location points.');
  return validPoints;
}

function resampleRoute(routePoints, pointCount) {
  return Array.from({ length: pointCount }, (_, index) => {
    const routePosition = (index / (pointCount - 1)) * (routePoints.length - 1);
    const segmentIndex = Math.min(Math.floor(routePosition), routePoints.length - 2);
    const segmentProgress = routePosition - segmentIndex;
    const start = routePoints[segmentIndex];
    const end = routePoints[segmentIndex + 1];

    return {
      latitude: start.latitude + (end.latitude - start.latitude) * segmentProgress,
      longitude: start.longitude + (end.longitude - start.longitude) * segmentProgress,
    };
  });
}

function runProcess(command, args, { input, label }) {
  const child = spawn(command, args, { stdio: [input === undefined ? 'ignore' : 'pipe', 'inherit', 'inherit'] });
  children.add(child);

  if (input !== undefined) child.stdin.end(input);

  return new Promise((resolvePromise, rejectPromise) => {
    child.once('error', (error) => rejectPromise(new Error(`${label}: ${error.message}`)));
    child.once('close', (code, signal) => {
      children.delete(child);
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`${label} exited with ${signal ?? `code ${code}`}.`));
    });
  });
}

function stopPlayback(signal) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill(signal);
  for (const udid of iosDeviceIds) {
    spawnSync('xcrun', ['simctl', 'location', udid, 'clear'], { stdio: 'ignore' });
  }
}

function printHelp() {
  console.log(`Usage: yarn location:route:both [--route <path|https-url|s3://bucket/key>] [--points 5000] [--speed 7.5]

Without --route, uses the newest ~/Downloads/locations-v1*.json.gz file.
Starts playback on all currently booted iOS simulators and online Android emulators.
Press Ctrl+C to stop playback.`);
}

async function main() {
  const options = getOptions(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const androidEmulators = getAndroidEmulators();
  const iosSimulators = getBootedIosSimulators();
  if (!androidEmulators.length) throw new Error('No online Android emulator is running. Start it and try again.');
  if (!iosSimulators.length) throw new Error('No booted iOS simulator is running. Start it and try again.');

  const source = options.route ?? findLatestDownloadedRoute();
  const routePath = await downloadRoute(source);
  const routePoints = decodeRoute(routePath);
  const playbackPoints = resampleRoute(routePoints, options.points);
  const iosInput = `${playbackPoints.map(({ latitude, longitude }) => `${latitude},${longitude}`).join('\n')}\n`;
  iosDeviceIds = iosSimulators.map(({ udid }) => udid);

  console.log(
    `Route ${basename(routePath)}: ${routePoints.length} source points, ${playbackPoints.length} playback points at ${options.speed} m/s.`,
  );
  console.log(`Android emulators: ${androidEmulators.join(', ')}`);
  console.log(`iOS simulators: ${iosSimulators.map(({ name }) => name).join(', ')}`);
  console.log('Starting playback on both platforms. Press Ctrl+C to stop.');

  const tasks = [
    ...iosSimulators.map(({ name, udid }) =>
      runProcess('xcrun', ['simctl', 'location', udid, 'start', `--speed=${options.speed}`, '--interval=1', '-'], {
        input: iosInput,
        label: `iOS simulator ${name}`,
      }),
    ),
    ...androidEmulators.map((device) =>
      runProcess(
        process.execPath,
        [
          androidPlayer,
          '--route',
          routePath,
          '--points',
          String(options.points),
          '--speed',
          String(options.speed),
          '--device',
          device,
        ],
        { label: `Android emulator ${device}` },
      ),
    ),
  ];

  await Promise.all(tasks);
  console.log('Route playback finished on all simulators.');
}

process.once('SIGINT', () => {
  interrupted = true;
  stopPlayback('SIGINT');
  process.exitCode = 130;
});
process.once('SIGTERM', () => {
  interrupted = true;
  stopPlayback('SIGTERM');
  process.exitCode = 143;
});

main()
  .catch((error) => {
    stopPlayback('SIGTERM');
    if (!interrupted) {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
  })
  .finally(() => {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  });
