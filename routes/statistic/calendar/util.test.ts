import { LANGUAGES } from '@const/enums';
import { getDaysOfTheMonthWithNames } from './util';
import type { StatisticActivities } from './types';

describe('getDaysOfTheMonthWithNames', () => {
  it('uses localized headers and puts activities into their calendar day', () => {
    const activities: StatisticActivities = [
      { id: 'run-1', date: '2026-07-15T09:00:00.000Z', distance: 5000, duration: 1800000, sport: 'run' },
    ];

    const russianCalendar = getDaysOfTheMonthWithNames('2026', '6', activities, LANGUAGES.russian);
    const englishCalendar = getDaysOfTheMonthWithNames('2026', '6', [], LANGUAGES.english);

    expect(russianCalendar.wednesdays[0].dateValue).toBe('СР');
    expect(
      russianCalendar.wednesdays.find(({ dateValue }: { dateValue: string }) => dateValue === '15')?.activities,
    ).toEqual(activities);
    expect(englishCalendar.mondays[0].dateValue).toBe('MO');
    expect(englishCalendar.sundays[0].dateValue).toBe('SU');
  });

  it('adds leading empty cells for every possible first weekday and handles missing activities', () => {
    for (let month = 0; month < 12; month += 1) {
      const calendar = getDaysOfTheMonthWithNames('2026', `${month}`, undefined as never, LANGUAGES.english);
      const dates = Object.values(calendar).flatMap((days: { dateValue: string }[]) =>
        days.slice(1).map(({ dateValue }: { dateValue: string }) => dateValue),
      );

      expect(dates.filter((dateValue) => /^\d+$/.test(dateValue))).toHaveLength(new Date(2026, month + 1, 0).getDate());
    }
  });
});
