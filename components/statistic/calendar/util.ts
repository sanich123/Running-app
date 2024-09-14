import { LANGUAGES } from '@const/enums';
import { mapIndexToDayOfWeek, ReducedDatesByDayOfTheWeek, StatisticActivities } from './types';
import { REDUCED_DAY_NAME_EN, REDUCED_DAY_NAME_RU } from './const';

export function getDaysOfTheMonthWithNames(
  year: string,
  month: string,
  activities: StatisticActivities,
  language: LANGUAGES,
) {
  const daysInMonth = new Date(+year, +month + 1, 0).getDate();
  const isRussian = language === LANGUAGES.russian;
  let daysOfTheWeek = [...Array(daysInMonth).keys()].reduce<ReducedDatesByDayOfTheWeek>(
    (acc, day) => {
      const dateFromDay = new Date(+year, +month, day + 1);
      const dayFromDate = dateFromDay.getDay();
      const incrementedDay = day + 1;
      const activitiesInThatDay = activities?.filter(({ date }) => new Date(date).getDate() === dateFromDay.getDate());
      acc[
        mapIndexToDayOfWeek[dayFromDate as keyof typeof mapIndexToDayOfWeek] as keyof ReducedDatesByDayOfTheWeek
      ].push({
        dateValue: `${incrementedDay}`,
        activities: activitiesInThatDay,
      });
      return acc;
    },
    {
      mondays: [{ dateValue: isRussian ? REDUCED_DAY_NAME_RU.monday : REDUCED_DAY_NAME_EN.monday, activities: [] }],
      tuesdays: [{ dateValue: isRussian ? REDUCED_DAY_NAME_RU.tuesday : REDUCED_DAY_NAME_EN.tuesday, activities: [] }],
      wednesdays: [
        { dateValue: isRussian ? REDUCED_DAY_NAME_RU.wednesday : REDUCED_DAY_NAME_EN.wednesday, activities: [] },
      ],
      thursdays: [
        { dateValue: isRussian ? REDUCED_DAY_NAME_RU.thursday : REDUCED_DAY_NAME_EN.thursday, activities: [] },
      ],
      fridays: [{ dateValue: isRussian ? REDUCED_DAY_NAME_RU.friday : REDUCED_DAY_NAME_EN.friday, activities: [] }],
      saturdays: [
        { dateValue: isRussian ? REDUCED_DAY_NAME_RU.saturday : REDUCED_DAY_NAME_EN.saturday, activities: [] },
      ],
      sundays: [{ dateValue: isRussian ? REDUCED_DAY_NAME_RU.sunday : REDUCED_DAY_NAME_EN.sunday, activities: [] }],
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
