import { DaysOfTheWeek } from './const';

export function getDaysOfTheMonthWithNames(
  year: string,
  month: string,
  activities: { duration: number; distance: number; id: string; sport: string; date: string }[],
) {
  const daysInMonth = new Date(+year, +month + 1, 0).getDate();

  let daysOfTheWeek = [...Array(daysInMonth).keys()].reduce(
    (acc, day) => {
      const dateFromDay = new Date(+year, +month, day + 1);
      const dayFromDate = dateFromDay.getDay();
      const incrementedDay = day + 1;
      console.log(activities.filter(({ date }) => new Date(date).getDate() === dateFromDay.getDate()));
      if (dayFromDate === 0) {
        acc.sundays.push({ dateValue: `${incrementedDay}` });
      }
      if (dayFromDate === 1) {
        acc.mondays.push({ dateValue: `${incrementedDay}` });
      }
      if (dayFromDate === 2) {
        acc.tuesdays.push({ dateValue: `${incrementedDay}` });
      }
      if (dayFromDate === 3) {
        acc.wednesdays.push({ dateValue: `${incrementedDay}` });
      }
      if (dayFromDate === 4) {
        acc.thursdays.push({ dateValue: `${incrementedDay}` });
      }
      if (dayFromDate === 5) {
        acc.fridays.push({ dateValue: `${incrementedDay}` });
      }
      if (dayFromDate === 6) {
        acc.saturdays.push({ dateValue: `${incrementedDay}` });
      }
      return acc;
    },
    {
      [DaysOfTheWeek.mondays]: [{ dateValue: 'ПН' }],
      [DaysOfTheWeek.tuesdays]: [{ dateValue: 'ВТ' }],
      [DaysOfTheWeek.wednesdays]: [{ dateValue: 'СР' }],
      [DaysOfTheWeek.thursdays]: [{ dateValue: 'ЧТ' }],
      [DaysOfTheWeek.fridays]: [{ dateValue: 'ПТ' }],
      [DaysOfTheWeek.saturdays]: [{ dateValue: 'СБ' }],
      [DaysOfTheWeek.sundays]: [{ dateValue: 'ВС' }],
    },
  );
  if (+daysOfTheWeek.mondays[1] > 1) {
    daysOfTheWeek.mondays.splice(1, 0, { dateValue: ' ' });
  }
  if (+daysOfTheWeek.tuesdays[1] > 2) {
    daysOfTheWeek.tuesdays.splice(1, 0, { dateValue: ' ' });
  }
  if (+daysOfTheWeek.wednesdays[1] > 3) {
    daysOfTheWeek.wednesdays.splice(1, 0, { dateValue: ' ' });
  }
  if (+daysOfTheWeek.thursdays[1] > 4) {
    daysOfTheWeek.thursdays.splice(1, 0, { dateValue: ' ' });
  }
  if (+daysOfTheWeek.fridays[1] > 5) {
    daysOfTheWeek.fridays.splice(1, 0, { dateValue: ' ' });
  }
  if (+daysOfTheWeek.saturdays[1] > 6) {
    daysOfTheWeek.saturdays.splice(1, 0, { dateValue: ' ' });
  }
  if (+daysOfTheWeek.sundays[1] > 7) {
    daysOfTheWeek.sundays.splice(1, 0, { dateValue: ' ' });
  }

  return daysOfTheWeek;
}
