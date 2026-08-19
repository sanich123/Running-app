import { getHoursMinutesSecondsFromMilliseconds, getMillisecondsFromHoursMinutesSeconds } from './time-formatter';

describe('editable activity duration', () => {
  it('splits a duration into hours, minutes and seconds without losing the minute boundary', () => {
    expect(getHoursMinutesSecondsFromMilliseconds(3_661_000)).toEqual({ hours: 1, minutes: 1, seconds: 1 });
    expect(getHoursMinutesSecondsFromMilliseconds(59_999)).toEqual({ hours: 0, minutes: 0, seconds: 59 });
  });

  it('builds milliseconds from all editable duration fields', () => {
    expect(getMillisecondsFromHoursMinutesSeconds(1, 1, 1)).toBe(3_661_000);
  });
});
