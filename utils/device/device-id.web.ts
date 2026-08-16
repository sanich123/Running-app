const key = 'runich-device-id';

export const deviceId = (() => {
  const existing = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  if (existing) return existing;
  const created = globalThis.crypto?.randomUUID?.() ?? `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  if (typeof localStorage !== 'undefined') localStorage.setItem(key, created);
  return created;
})();

export const deviceName = 'Web browser';
export const platform = 'web';
export const deviceMetadata = {
  model: undefined,
  manufacturer: undefined,
  osName: undefined,
  osVersion: undefined,
  deviceType: undefined,
  appVersion: undefined,
  appBuild: undefined,
};
