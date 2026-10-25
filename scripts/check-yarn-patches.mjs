import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const patchesDirectory = path.join(projectRoot, '.yarn', 'patches');
const manifest = JSON.parse(await readFile(path.join(projectRoot, 'package.json'), 'utf8'));
const lockfile = await readFile(path.join(projectRoot, 'yarn.lock'), 'utf8');
const dependencies = { ...manifest.dependencies, ...manifest.devDependencies };
const resolutions = Object.entries(manifest.resolutions ?? {});
const referencedPatchFiles = new Set();
const errors = [];

for (const [name, version] of Object.entries(dependencies)) {
  if (typeof version === 'string' && version.startsWith('patch:')) {
    errors.push(
      `${name} uses a patch directly in dependencies; keep its Expo-compatible version here and patch it in resolutions.`,
    );
  }
}

for (const [name, descriptor] of resolutions) {
  if (typeof descriptor !== 'string' || !descriptor.startsWith('patch:')) continue;

  const [packageLocator, patchLocator] = descriptor.slice('patch:'.length).split('#', 2);
  const packageVersion = packageLocator.match(/@npm%3A(.+)$/)?.[1];
  const packageRange = dependencies[name];
  const relativePatchPath = patchLocator?.replace(/^~\//, '').replace(/^\.\//, '');

  if (!packageVersion || !relativePatchPath) {
    errors.push(`${name} has an invalid Yarn patch descriptor in resolutions.`);
    continue;
  }

  if (!relativePatchPath.startsWith('.yarn/patches/')) {
    errors.push(`${name} patch must live under .yarn/patches; found ${relativePatchPath}.`);
    continue;
  }

  const absolutePatchPath = path.resolve(projectRoot, relativePatchPath);
  const relativeToPatchDirectory = path.relative(patchesDirectory, absolutePatchPath);
  if (relativeToPatchDirectory.startsWith('..') || path.isAbsolute(relativeToPatchDirectory)) {
    errors.push(`${name} patch path escapes .yarn/patches.`);
    continue;
  }

  referencedPatchFiles.add(path.basename(absolutePatchPath));

  if (!lockfile.includes(path.basename(absolutePatchPath))) {
    errors.push(`${name} patch is missing from yarn.lock; run yarn install after changing resolutions.`);
  }

  if (typeof packageRange !== 'string' || packageRange.startsWith('patch:')) {
    errors.push(`${name} must keep its regular package version in dependencies or devDependencies.`);
    continue;
  }

  const normalizedRange = packageRange.replace(/^[~^]/, '');
  if (normalizedRange !== packageVersion) {
    errors.push(
      `${name} patch targets ${packageVersion}, but package.json requests ${packageRange}; rebase the patch.`,
    );
  }
}

const patchFiles = (await readdir(patchesDirectory)).filter((file) => file.endsWith('.patch'));
for (const referencedPatchFile of referencedPatchFiles) {
  if (!patchFiles.includes(referencedPatchFile)) {
    errors.push(`${referencedPatchFile} is referenced by package.json but missing from .yarn/patches.`);
  }
}

for (const patchFile of patchFiles) {
  if (!referencedPatchFiles.has(patchFile)) errors.push(`${patchFile} is not referenced by package.json resolutions.`);
}

if (errors.length > 0) {
  process.stderr.write(`Yarn patch validation failed:\n${errors.map((error) => `- ${error}`).join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Validated ${patchFiles.length} Yarn patches.\n`);
}
