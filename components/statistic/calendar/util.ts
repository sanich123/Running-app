export function getDaysOfTheMonthWithNames(year: string, month: string) {
  const daysInMonth = new Date(+year, +month + 1, 0).getDate();
  const { mondays, tuesdays, wednesdays, thursdays, fridays, saturdays, sundays } = [
    ...Array(daysInMonth).keys(),
  ].reduce(
    (acc, day) => {
      const dateFromDay = new Date(+year, +month, day + 1);
      const dayFromDate = dateFromDay.getDay();
      const incrementedDay = day + 1;
      if (dayFromDate === 0) {
        acc.sundays.push(`${incrementedDay}`);
      }
      if (dayFromDate === 1) {
        acc.mondays.push(`${incrementedDay}`);
      }
      if (dayFromDate === 2) {
        acc.tuesdays.push(`${incrementedDay}`);
      }
      if (dayFromDate === 3) {
        acc.wednesdays.push(`${incrementedDay}`);
      }
      if (dayFromDate === 4) {
        acc.thursdays.push(`${incrementedDay}`);
      }
      if (dayFromDate === 5) {
        acc.fridays.push(`${incrementedDay}`);
      }
      if (dayFromDate === 6) {
        acc.saturdays.push(`${incrementedDay}`);
      }
      return acc;
    },
    {
      mondays: ['п'],
      tuesdays: ['в'],
      wednesdays: ['в'],
      thursdays: ['ч'],
      fridays: ['п'],
      saturdays: ['с'],
      sundays: ['в'],
    },
  );
  return { mondays, tuesdays, wednesdays, thursdays, fridays, saturdays, sundays };
}
