import { getCurrentWeekDates } from './util';

describe('getCurrentWeekDates', () => {
  it('returns a Monday to Sunday week for a Sunday input', () => {
    expect(getCurrentWeekDates(new Date(2026, 7, 16, 12)).week).toEqual([
      '2026-08-10',
      '2026-08-11',
      '2026-08-12',
      '2026-08-13',
      '2026-08-14',
      '2026-08-15',
      '2026-08-16',
    ]);
  });

  it('keeps the local year and month of the current day for navigation', () => {
    expect(getCurrentWeekDates(new Date(2026, 0, 1, 12))).toMatchObject({
      year: 2026,
      month: 0,
      week: ['2025-12-29', '2025-12-30', '2025-12-31', '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04'],
    });
  });
});
