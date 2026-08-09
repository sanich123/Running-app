export function getCurrentWeekDates() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const week = [];

  for (let i = 1; i <= 7; i++) {
    const first = currentDate.getDate() - currentDate.getDay() + i;
    const day = new Date(currentDate.setDate(first)).toDateString();
    week.push(day);
  }

  return { week, year, month };
}
