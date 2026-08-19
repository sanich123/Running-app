/* global console, fetch, process, setTimeout */

import { execFileSync, spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);
const getArg = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};

const appId = process.env.RUNICH_E2E_APP_ID ?? 'com.sanich123.runningapp';
const backendDirValue = process.env.RUNICH_BACKEND_DIR ?? '../../runich-backend/project';
const backendDir = isAbsolute(backendDirValue) ? backendDirValue : resolve(projectDir, backendDirValue);
const backendUrl = process.env.RUNICH_E2E_SERVER_URL ?? 'http://127.0.0.1:3000';
const androidBaseUrl = process.env.RUNICH_E2E_ANDROID_BASE_URL ?? 'http://10.0.2.2:3000';
const databaseComposeFile = resolve(projectDir, 'scripts/e2e-postgres.compose.yml');
const databasePort = process.env.RUNICH_E2E_DB_PORT ?? '55432';
const email = process.env.RUNICH_E2E_EMAIL ?? 'e2e@runich.app';
const password = process.env.RUNICH_E2E_PASSWORD ?? '7FWD&rlm';
const flowPath = resolve(projectDir, getArg('--flow', '.maestro/smoke.yaml'));
const deviceFromEnv = process.env.ANDROID_SERIAL;

const managedProcesses = new Set();

function run(command, commandArgs, options = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, commandArgs, {
      cwd: options.cwd ?? projectDir,
      env: { ...process.env, ...options.env },
      stdio: 'inherit',
    });

    child.once('error', rejectPromise);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`${command} ${commandArgs.join(' ')} exited with ${signal ?? `code ${code}`}`));
      }
    });
  });
}

function start(command, commandArgs, options = {}) {
  const child = spawn(command, commandArgs, {
    cwd: options.cwd ?? projectDir,
    env: { ...process.env, ...options.env },
    stdio: 'inherit',
  });
  managedProcesses.add(child);
  child.once('exit', () => managedProcesses.delete(child));
  return child;
}

function stop(child) {
  if (child && !child.killed) {
    child.kill('SIGTERM');
  }
}

function adb(serial, commandArgs, options = {}) {
  return execFileSync('adb', ['-s', serial, ...commandArgs], {
    encoding: 'utf8',
    stdio: options.inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
  });
}

function getOnlineDevices() {
  const output = execFileSync('adb', ['devices'], { encoding: 'utf8' });
  return output
    .split('\n')
    .slice(1)
    .map((line) => line.trim().split(/\s+/))
    .filter(([serial, state]) => serial && state === 'device')
    .map(([serial]) => serial);
}

function readEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  return Object.fromEntries(
    readFileSync(filePath, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        const key = line.slice(0, separator).trim();
        const value = line
          .slice(separator + 1)
          .trim()
          .replace(/^(['"])(.*)\1$/, '$2');
        return [key, value];
      }),
  );
}

function requireCommand(command, installHint) {
  try {
    execFileSync(command, ['--version'], { stdio: 'ignore' });
    return command;
  } catch {
    const installedPath = resolve(homedir(), '.maestro', 'bin', command);
    try {
      execFileSync(installedPath, ['--version'], { stdio: 'ignore' });
      return installedPath;
    } catch {
      throw new Error(`${command} is required for Android E2E. ${installHint}`);
    }
  }
}

function packageIsInstalled(serial) {
  try {
    return adb(serial, ['shell', 'pm', 'path', appId])
      .split('\n')
      .some((line) => line.trim().startsWith('package:'));
  } catch {
    return false;
  }
}

async function waitFor(description, predicate, timeoutMs = 180_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await predicate()) return;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 1000));
  }
  throw new Error(`Timed out waiting for ${description}`);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers ?? {}) },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = text;
  }
  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${url} returned ${response.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function waitForBackend() {
  await waitFor('the local backend', async () => {
    try {
      const response = await fetch(`${backendUrl}/auth/config`);
      return response.ok;
    } catch {
      return false;
    }
  });
}

async function prepareUser() {
  const session = await requestJson(`${backendUrl}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!session?.userId || !session?.accessToken) {
    throw new Error('The local backend returned an incomplete E2E login session.');
  }

  await requestJson(`${backendUrl}/user/${session.userId}/profile`, {
    method: 'PATCH',
    headers: { authorization: `Bearer ${session.accessToken}` },
    body: JSON.stringify({
      name: 'E2E',
      surname: 'Runner',
      city: 'Moscow',
      sport: 'RUNNING',
      gender: 'MALE',
      weight: '70',
      bio: 'Local Android E2E user',
    }),
  });
}

async function startE2eDatabase() {
  const backendEnv = readEnvFile(resolve(backendDir, '.env'));
  const dbUser = process.env.RUNICH_E2E_DB_USER ?? backendEnv.POSTGRES_USER ?? 'runich';
  const dbPassword = process.env.RUNICH_E2E_DB_PASSWORD ?? backendEnv.POSTGRES_PASSWORD;
  const dbName = process.env.RUNICH_E2E_DB_NAME ?? backendEnv.POSTGRES_DB ?? 'runich_db';
  if (!dbPassword) {
    throw new Error(`POSTGRES_PASSWORD is missing in ${resolve(backendDir, '.env')}.`);
  }

  const databaseUrl = `postgresql://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@127.0.0.1:${databasePort}/${encodeURIComponent(dbName)}`;
  const composeEnv = {
    RUNICH_E2E_DB_USER: dbUser,
    RUNICH_E2E_DB_PASSWORD: dbPassword,
    RUNICH_E2E_DB_NAME: dbName,
    RUNICH_E2E_DB_PORT: databasePort,
  };
  await run('docker', ['compose', '-f', databaseComposeFile, 'up', '-d', '--wait'], { env: composeEnv });
  return { databaseUrl, composeEnv };
}

async function stopE2eDatabase(composeEnv) {
  try {
    await run('docker', ['compose', '-f', databaseComposeFile, 'down', '--volumes'], { env: composeEnv });
  } catch (error) {
    console.warn(`Could not stop the isolated E2E database: ${error instanceof Error ? error.message : error}`);
  }
}

function grantAndroidPermissions(serial) {
  for (const permission of [
    'android.permission.ACCESS_COARSE_LOCATION',
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.ACCESS_BACKGROUND_LOCATION',
  ]) {
    adb(serial, ['shell', 'pm', 'grant', appId, permission], { inherit: true });
  }
  try {
    adb(serial, ['shell', 'settings', 'put', 'secure', 'location_mode', '3'], { inherit: true });
  } catch {
    console.warn('Could not enable Android location services through adb; enable them in the emulator settings.');
  }
  try {
    adb(serial, ['reverse', 'tcp:3000', 'tcp:3000'], { inherit: true });
  } catch {
    console.warn('Could not create adb reverse for port 3000; the app will use the configured emulator host URL.');
  }
}

async function main() {
  const backendOnly = hasFlag('--backend-only');
  if (!hasFlag('--skip-backend') && !existsSync(backendDir)) {
    throw new Error(`Backend directory does not exist: ${backendDir}`);
  }
  if (!existsSync(flowPath)) {
    throw new Error(`Maestro flow does not exist: ${flowPath}`);
  }

  let serial;
  let maestroCommand;
  if (!backendOnly) {
    maestroCommand = requireCommand(
      'maestro',
      'Install it from https://docs.maestro.dev/getting-started/installing-maestro.',
    );
    const devices = getOnlineDevices();
    if (!devices.length) {
      throw new Error('No online Android emulator found. Start an emulator before running E2E.');
    }
    if (!deviceFromEnv && devices.length > 1) {
      throw new Error(`More than one Android device is online. Set ANDROID_SERIAL (for example ${devices[0]}).`);
    }
    serial = deviceFromEnv ?? devices[0];
    console.log(`Using Android device ${serial}`);
  }

  let backendProcess;
  let buildProcess;
  let routeProcess;
  let database;
  try {
    if (!hasFlag('--skip-backend')) {
      database = await startE2eDatabase();
      const backendDatabaseEnv = { DATABASE_URL: database.databaseUrl };
      await run('yarn', ['prisma', 'migrate', 'deploy'], {
        cwd: backendDir,
        env: backendDatabaseEnv,
      });
      await run('yarn', ['prisma', 'db', 'seed'], {
        cwd: backendDir,
        env: { ...backendDatabaseEnv, SEED_USER_EMAIL: email },
      });
      backendProcess = start('yarn', ['start:dev'], {
        cwd: backendDir,
        env: { ...backendDatabaseEnv, PORT: '3000', SEED_MOCK_DATA: 'false' },
      });
    }

    await waitForBackend();
    await prepareUser();

    if (backendOnly) {
      console.log('Backend E2E bootstrap finished successfully.');
      return;
    }

    if (!hasFlag('--skip-build')) {
      try {
        adb(serial, ['shell', 'am', 'force-stop', appId], { inherit: true });
        adb(serial, ['uninstall', appId], { inherit: true });
      } catch {
        // The package may not be installed yet.
      }
      buildProcess = start('yarn', ['android'], {
        env: {
          APP_VARIANT: 'development',
          EXPO_PUBLIC_BASE_URL: androidBaseUrl,
          ANDROID_SERIAL: serial,
        },
      });
      await waitFor(`the ${appId} Android build`, () => packageIsInstalled(serial));
    } else if (!packageIsInstalled(serial)) {
      throw new Error(`Android package ${appId} is not installed. Remove --skip-build or install a local debug build.`);
    }

    grantAndroidPermissions(serial);

    if (!hasFlag('--no-route')) {
      routeProcess = start(process.execPath, [
        'scripts/location-route.mjs',
        '--points',
        getArg('--route-points', '3000'),
        '--interval',
        getArg('--route-interval', '100'),
        '--device',
        serial,
      ]);
    }

    await run(maestroCommand, [
      '--device',
      serial,
      'test',
      '-e',
      `E2E_EMAIL=${email}`,
      '-e',
      `E2E_PASSWORD=${password}`,
      flowPath,
    ]);
    console.log('Android E2E finished successfully.');
  } finally {
    stop(routeProcess);
    if (!hasFlag('--skip-backend')) stop(backendProcess);
    stop(buildProcess);
    managedProcesses.forEach(stop);
    if (database) await stopE2eDatabase(database.composeEnv);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
