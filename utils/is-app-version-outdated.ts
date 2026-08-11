const VERSION_PARTS_COUNT = 3;

function parseVersion(version: string) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    return null;
  }

  return version.split('.').map(Number);
}

export function isAppVersionOutdated(currentVersion: string, requiredVersion: string) {
  const current = parseVersion(currentVersion);
  const required = parseVersion(requiredVersion);

  if (!current || !required) {
    return false;
  }

  for (let index = 0; index < VERSION_PARTS_COUNT; index += 1) {
    if (current[index] !== required[index]) {
      return (current[index] ?? 0) < (required[index] ?? 0);
    }
  }

  return false;
}
