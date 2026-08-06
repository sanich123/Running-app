export function expectComponentModule(componentModule: Record<string, unknown>) {
  const exports = Object.values(componentModule);
  expect(exports.length).toBeGreaterThan(0);
  expect(exports.some((value) => typeof value === 'function' || (typeof value === 'object' && value !== null))).toBe(
    true,
  );
}
