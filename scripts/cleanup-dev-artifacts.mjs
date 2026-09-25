#!/usr/bin/env node
/* eslint-disable no-undef */

import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { homedir, platform } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const homeRoot = homedir();
const cleanCarRoot = resolve(projectRoot, '../../clean-car/project');
const projectRoots = [projectRoot, cleanCarRoot].filter((root) => existsSync(root));
const argv = process.argv.slice(2);
const apply = argv.includes('--apply');
const isDryRun = !apply;

function hasFlag(flag) {
  return argv.includes(flag);
}

function readOption(flag, fallback) {
  const index = argv.indexOf(flag);
  if (index === -1) return fallback;

  const value = argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function readNonNegativeInteger(flag, fallback) {
  const value = Number.parseInt(readOption(flag, String(fallback)), 10);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${flag} must be a non-negative integer`);
  }
  return value;
}

function printHelp() {
  console.log(`Usage:
  node scripts/cleanup-dev-artifacts.mjs                 # dry-run, no changes
  node scripts/cleanup-dev-artifacts.mjs --apply         # caches, builds, old NDKs

Optional scopes:
  --android-sdk                                      remove unused platform/build-tools versions
  --archives                                         include old Xcode archives
  --archive-age-days N                              archive age threshold, default: 30
  --keep-latest N                                   preserve newest N archives, default: 1
  --local-builds                                    include old APK/AAB/IPA files from ~/Desktop/runich-app
  --build-age-days N                                local build age threshold, default: 30
  --keep-latest-builds N                            preserve newest N local builds, default: 1
  --docker-images                                   prune unused Docker images/containers/networks
  --runtime-uuid UUID                               delete one explicitly verified Simulator runtime

Examples:
  node scripts/cleanup-dev-artifacts.mjs --apply --android-sdk
  node scripts/cleanup-dev-artifacts.mjs --apply --archives --archive-age-days 30
  node scripts/cleanup-dev-artifacts.mjs --apply --archives --archive-age-days 0 --keep-latest 0
  node scripts/cleanup-dev-artifacts.mjs --apply --local-builds --build-age-days 30
  node scripts/cleanup-dev-artifacts.mjs --apply --docker-images
`);
}

if (hasFlag('--help') || hasFlag('-h')) {
  printHelp();
  process.exit(0);
}

const archiveAgeDays = readNonNegativeInteger('--archive-age-days', 30);
const keepLatestArchives = readNonNegativeInteger('--keep-latest', 1);
const localBuildAgeDays = readNonNegativeInteger('--build-age-days', 30);
const keepLatestBuilds = readNonNegativeInteger('--keep-latest-builds', 1);
const runtimeUuid = readOption('--runtime-uuid', null);

if (runtimeUuid && !/^[0-9a-f-]{8,}$/i.test(runtimeUuid)) {
  throw new Error('--runtime-uuid must be a UUID returned by xcrun simctl runtime list -v');
}

if (platform() !== 'darwin' && (hasFlag('--archives') || hasFlag('--android-sdk') || runtimeUuid)) {
  throw new Error('Xcode/Android SDK cleanup is supported on macOS only');
}

const actions = [];
const skipped = [];

function displayPath(target) {
  const homeRelative = relative(homeRoot, target);
  return homeRelative && !homeRelative.startsWith('..') ? `~/${homeRelative}` : target;
}

function assertSafeTarget(target) {
  const normalized = resolve(target);
  if (normalized === '/' || normalized === homeRoot || normalized === projectRoot) {
    throw new Error(`Refusing to delete broad path: ${normalized}`);
  }
  return normalized;
}

function addPathAction(label, target, category) {
  const normalized = assertSafeTarget(target);
  if (!existsSync(normalized)) {
    skipped.push(`${label}: already absent`);
    return;
  }
  actions.push({ category, kind: 'path', label, target: normalized });
}

function addCommandAction(label, command, args, category, applyCommand = null) {
  actions.push({ category, kind: 'command', label, command, args, applyCommand });
}

function parseReactNativeAndroidVersions(root) {
  const versionsPath = join(root, 'node_modules/react-native/gradle/libs.versions.toml');
  if (!existsSync(versionsPath)) return null;

  const source = readFileSync(versionsPath, 'utf8');
  const get = (name) => source.match(new RegExp(`^${name}\\s*=\\s*["']([^"']+)["']`, 'm'))?.[1] ?? null;
  return {
    root,
    ndkVersion: get('ndkVersion'),
    compileSdk: get('compileSdk'),
    targetSdk: get('targetSdk'),
    buildTools: get('buildTools'),
  };
}

const androidVersions = projectRoots.map(parseReactNativeAndroidVersions).filter(Boolean);
const requiredNdks = new Set(androidVersions.map(({ ndkVersion }) => ndkVersion).filter(Boolean));

function addCacheActions() {
  const globalPaths = [
    ['Gradle dependency cache', join(homeRoot, '.gradle/caches')],
    ['Gradle daemon data', join(homeRoot, '.gradle/daemon')],
    ['npm content cache', join(homeRoot, '.npm/_cacache')],
    ['npm logs', join(homeRoot, '.npm/_logs')],
    ['Yarn Berry cache', join(homeRoot, '.yarn/berry/cache')],
    ['Expo global cache', join(homeRoot, '.expo')],
    ['Xcode DerivedData', join(homeRoot, 'Library/Developer/Xcode/DerivedData')],
    ['Xcode cache', join(homeRoot, 'Library/Caches/com.apple.dt.Xcode')],
  ];

  for (const [label, target] of globalPaths) addPathAction(label, target, 'cache');

  for (const root of projectRoots) {
    const name = root === projectRoot ? 'Runich' : 'Clean Car';
    const paths = [
      [`${name} Expo cache`, join(root, '.expo')],
      [`${name} Android Gradle cache`, join(root, 'android/.gradle')],
      [`${name} Android build`, join(root, 'android/build')],
      [`${name} Android app build`, join(root, 'android/app/build')],
      [`${name} iOS build`, join(root, 'ios/build')],
    ];
    for (const [label, target] of paths) addPathAction(label, target, 'build/cache');
  }
}

function addObsoleteNdkActions() {
  const ndkRoot = join(homeRoot, 'Library/Android/sdk/ndk');
  if (!existsSync(ndkRoot)) {
    skipped.push('Android NDK directory: already absent');
    return;
  }

  if (requiredNdks.size === 0) {
    skipped.push('Android NDK cleanup: no React Native version file was verified');
    return;
  }

  for (const entry of readdirSync(ndkRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || requiredNdks.has(entry.name)) continue;
    addPathAction(`Unused Android NDK ${entry.name}`, join(ndkRoot, entry.name), 'Android SDK');
  }
}

function addOptionalAndroidSdkActions() {
  if (!hasFlag('--android-sdk')) return;

  const requiredPlatforms = new Set(
    androidVersions.flatMap(({ compileSdk, targetSdk }) => [compileSdk, targetSdk]).filter(Boolean),
  );
  const requiredBuildTools = new Set(androidVersions.map(({ buildTools }) => buildTools).filter(Boolean));

  if (requiredPlatforms.size === 0 || requiredBuildTools.size === 0) {
    skipped.push('Android platform/build-tools cleanup: no verified React Native SDK versions');
    return;
  }

  const platformsRoot = join(homeRoot, 'Library/Android/sdk/platforms');
  if (existsSync(platformsRoot)) {
    for (const entry of readdirSync(platformsRoot, { withFileTypes: true })) {
      const api = entry.name.match(/^android-(\d+)(?:\.\d+)?$/)?.[1];
      if (entry.isDirectory() && api && !requiredPlatforms.has(api)) {
        addPathAction(`Unused Android platform ${entry.name}`, join(platformsRoot, entry.name), 'Android SDK');
      }
    }
  }

  const buildToolsRoot = join(homeRoot, 'Library/Android/sdk/build-tools');
  if (existsSync(buildToolsRoot)) {
    for (const entry of readdirSync(buildToolsRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && !requiredBuildTools.has(entry.name)) {
        addPathAction(`Unused Android build-tools ${entry.name}`, join(buildToolsRoot, entry.name), 'Android SDK');
      }
    }
  }
}

function addArchiveActions() {
  if (!hasFlag('--archives')) return;

  const archivesRoot = join(homeRoot, 'Library/Developer/Xcode/Archives');
  if (!existsSync(archivesRoot)) {
    skipped.push('Xcode Archives: already absent');
    return;
  }

  const archives = [];
  for (const day of readdirSync(archivesRoot, { withFileTypes: true })) {
    if (!day.isDirectory()) continue;
    const dayPath = join(archivesRoot, day.name);
    for (const archive of readdirSync(dayPath, { withFileTypes: true })) {
      if (!archive.isDirectory() || !archive.name.endsWith('.xcarchive')) continue;
      const target = join(dayPath, archive.name);
      archives.push({ target, mtimeMs: statSync(target).mtimeMs });
    }
  }

  archives.sort((a, b) => b.mtimeMs - a.mtimeMs);
  const cutoff = Date.now() - archiveAgeDays * 24 * 60 * 60 * 1000;
  const eligible = archives.filter(
    (archive, index) => index >= keepLatestArchives && (archiveAgeDays === 0 || archive.mtimeMs < cutoff),
  );

  for (const archive of eligible) {
    addPathAction(`Old Xcode archive ${displayPath(archive.target)}`, archive.target, 'iOS archive');
  }

  if (eligible.length === 0) {
    skipped.push(`Xcode Archives: no archives older than ${archiveAgeDays} days after keeping ${keepLatestArchives}`);
  }
}

function addLocalBuildActions() {
  if (!hasFlag('--local-builds')) return;

  const buildsRoot = join(homeRoot, 'Desktop/runich-app');
  if (!existsSync(buildsRoot)) {
    skipped.push('Local EAS builds: already absent');
    return;
  }

  const builds = readdirSync(buildsRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(apk|aab|ipa)$/i.test(entry.name))
    .map((entry) => {
      const target = join(buildsRoot, entry.name);
      return { target, mtimeMs: statSync(target).mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  const cutoff = Date.now() - localBuildAgeDays * 24 * 60 * 60 * 1000;
  const eligible = builds.filter(
    (build, index) => index >= keepLatestBuilds && (localBuildAgeDays === 0 || build.mtimeMs < cutoff),
  );

  for (const build of eligible) {
    addPathAction(`Old local EAS build ${displayPath(build.target)}`, build.target, 'local build');
  }

  if (eligible.length === 0) {
    skipped.push(`Local EAS builds: no builds older than ${localBuildAgeDays} days after keeping ${keepLatestBuilds}`);
  }
}

function addRuntimeAction() {
  if (!runtimeUuid) return;
  addCommandAction(
    `Delete explicitly selected Simulator runtime ${runtimeUuid}`,
    'xcrun',
    ['simctl', 'runtime', 'delete', runtimeUuid],
    'iOS Simulator',
    () => {
      const listed = spawnSync('xcrun', ['simctl', 'runtime', 'list', '-v'], { encoding: 'utf8' });
      const output = `${listed.stdout ?? ''}${listed.stderr ?? ''}`;
      if (listed.status !== 0 || !output.includes(runtimeUuid)) {
        throw new Error(`Runtime UUID ${runtimeUuid} was not found by xcrun simctl runtime list -v`);
      }
      return spawnSync('xcrun', ['simctl', 'runtime', 'delete', runtimeUuid], { stdio: 'inherit' }).status ?? 1;
    },
  );
}

function addDockerAction() {
  if (!hasFlag('--docker-images')) return;
  addCommandAction(
    'Prune unused Docker images, stopped containers and networks (volumes preserved)',
    'docker',
    ['system', 'prune', '--all', '--force'],
    'Docker',
    () => spawnSync('docker', ['system', 'prune', '--all', '--force'], { stdio: 'inherit' }).status ?? 1,
  );
}

function stopGradleDaemons() {
  for (const root of projectRoots) {
    const gradleWrapper = join(root, 'android/gradlew');
    if (!existsSync(gradleWrapper)) continue;
    console.log(`Stopping Gradle daemons in ${root}`);
    const result = spawnSync(gradleWrapper, ['--stop'], { cwd: join(root, 'android'), stdio: 'inherit' });
    if (result.error || result.status !== 0) {
      console.warn(`Warning: could not stop Gradle daemons for ${root}`);
    }
  }
}

function printPlan() {
  console.log(`${isDryRun ? 'DRY RUN' : 'APPLY'}: ${actions.length} cleanup action(s)`);
  for (const action of actions) {
    if (action.kind === 'path') {
      console.log(`  ${isDryRun ? 'would remove' : 'remove'} [${action.category}] ${displayPath(action.target)}`);
    } else {
      console.log(
        `  ${isDryRun ? 'would run' : 'run'} [${action.category}] ${action.command} ${action.args.join(' ')}`,
      );
    }
  }
  for (const message of skipped) console.log(`  skip: ${message}`);
}

function applyActions() {
  if (actions.some((action) => action.kind === 'path' && action.category !== 'iOS archive')) {
    stopGradleDaemons();
  }

  let failures = 0;
  for (const action of actions) {
    try {
      if (action.kind === 'path') {
        rmSync(action.target, { recursive: true, force: true });
      } else if (action.applyCommand() !== 0) {
        failures += 1;
      }
    } catch (error) {
      failures += 1;
      console.error(`Failed: ${action.label}`);
      console.error(error instanceof Error ? error.message : error);
    }
  }

  if (failures > 0) process.exitCode = 1;
}

addCacheActions();
addObsoleteNdkActions();
addOptionalAndroidSdkActions();
addArchiveActions();
addLocalBuildActions();
addRuntimeAction();
addDockerAction();
printPlan();

if (isDryRun) {
  console.log('\nNo files were changed. Add --apply to execute the listed path removals.');
} else if (actions.length > 0) {
  applyActions();
}
