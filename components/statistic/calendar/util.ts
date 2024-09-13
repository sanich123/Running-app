import { StatisticActivities } from './types';

export function getDaysOfTheMonthWithNames(year: string, month: string, activities: StatisticActivities) {
  const daysInMonth = new Date(+year, +month + 1, 0).getDate();

  let daysOfTheWeek = [...Array(daysInMonth).keys()].reduce<{
    sundays: { dateValue: string; activities: StatisticActivities }[];
    mondays: { dateValue: string; activities: StatisticActivities }[];
    tuesdays: { dateValue: string; activities: StatisticActivities }[];
    wednesdays: { dateValue: string; activities: StatisticActivities }[];
    thursdays: { dateValue: string; activities: StatisticActivities }[];
    fridays: { dateValue: string; activities: StatisticActivities }[];
    saturdays: { dateValue: string; activities: StatisticActivities }[];
  }>(
    (acc, day) => {
      const dateFromDay = new Date(+year, +month, day + 1);
      const dayFromDate = dateFromDay.getDay();
      const incrementedDay = day + 1;
      const activitiesInThatDay = activities?.filter(({ date }) => new Date(date).getDate() === dateFromDay.getDate());

      if (dayFromDate === 0) {
        acc.sundays.push({ dateValue: `${incrementedDay}`, activities: activitiesInThatDay });
      }
      if (dayFromDate === 1) {
        acc.mondays.push({ dateValue: `${incrementedDay}`, activities: activitiesInThatDay });
      }
      if (dayFromDate === 2) {
        acc.tuesdays.push({ dateValue: `${incrementedDay}`, activities: activitiesInThatDay });
      }
      if (dayFromDate === 3) {
        acc.wednesdays.push({ dateValue: `${incrementedDay}`, activities: activitiesInThatDay });
      }
      if (dayFromDate === 4) {
        acc.thursdays.push({ dateValue: `${incrementedDay}`, activities: activitiesInThatDay });
      }
      if (dayFromDate === 5) {
        acc.fridays.push({ dateValue: `${incrementedDay}`, activities: activitiesInThatDay });
      }
      if (dayFromDate === 6) {
        acc.saturdays.push({ dateValue: `${incrementedDay}`, activities: activitiesInThatDay });
      }
      return acc;
    },
    {
      mondays: [{ dateValue: 'ПН', activities: [] }],
      tuesdays: [{ dateValue: 'ВТ', activities: [] }],
      wednesdays: [{ dateValue: 'СР', activities: [] }],
      thursdays: [{ dateValue: 'ЧТ', activities: [] }],
      fridays: [{ dateValue: 'ПТ', activities: [] }],
      saturdays: [{ dateValue: 'СБ', activities: [] }],
      sundays: [{ dateValue: 'ВС', activities: [] }],
    },
  );

  if (+daysOfTheWeek.mondays[1].dateValue > 1) {
    daysOfTheWeek.mondays.splice(1, 0, { dateValue: ' ', activities: [] });
  }
  if (+daysOfTheWeek.tuesdays[1].dateValue > 2) {
    daysOfTheWeek.tuesdays.splice(1, 0, { dateValue: ' ', activities: [] });
  }
  if (+daysOfTheWeek.wednesdays[1].dateValue > 3) {
    daysOfTheWeek.wednesdays.splice(1, 0, { dateValue: ' ', activities: [] });
  }
  if (+daysOfTheWeek.thursdays[1].dateValue > 4) {
    daysOfTheWeek.thursdays.splice(1, 0, { dateValue: ' ', activities: [] });
  }
  if (+daysOfTheWeek.fridays[1].dateValue > 5) {
    daysOfTheWeek.fridays.splice(1, 0, { dateValue: ' ', activities: [] });
  }
  if (+daysOfTheWeek.saturdays[1]['dateValue'] > 6) {
    daysOfTheWeek.saturdays.splice(1, 0, { dateValue: ' ', activities: [] });
  }
  if (+daysOfTheWeek.sundays[1] > 7) {
    daysOfTheWeek.sundays.splice(1, 0, { dateValue: ' ', activities: [] });
  }

  return daysOfTheWeek;
}
