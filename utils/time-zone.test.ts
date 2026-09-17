import { getDeviceTimeZone } from './time-zone';

describe('getDeviceTimeZone', () => {
  it('returns a usable time zone identifier with a safe fallback', () => {
    expect(getDeviceTimeZone()).toEqual(expect.any(String));
    expect(getDeviceTimeZone().length).toBeGreaterThan(0);
  });
});
