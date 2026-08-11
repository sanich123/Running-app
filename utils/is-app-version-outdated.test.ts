import { isAppVersionOutdated } from './is-app-version-outdated';

describe('isAppVersionOutdated', () => {
  it('compares versions by major, minor and patch segments', () => {
    expect(isAppVersionOutdated('1.9.9', '2.0.0')).toBe(true);
    expect(isAppVersionOutdated('2.0.0', '2.0.1')).toBe(true);
    expect(isAppVersionOutdated('2.1.0', '2.0.9')).toBe(false);
    expect(isAppVersionOutdated('2.0.0', '2.0.0')).toBe(false);
  });

  it('ignores malformed versions', () => {
    expect(isAppVersionOutdated('2.0', '2.0.1')).toBe(false);
    expect(isAppVersionOutdated('2.0.0', 'latest')).toBe(false);
  });
});
