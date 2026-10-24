export const fetch = (...args: Parameters<typeof globalThis.fetch>): ReturnType<typeof globalThis.fetch> =>
  globalThis.fetch(...args);
