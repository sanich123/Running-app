export function getCurrentWeekDates() {
  let currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  let week = [];

  for (let i = 1; i <= 7; i++) {
    let first = currentDate.getDate() - currentDate.getDay() + i;
    let day = new Date(currentDate.setDate(first)).toDateString();
    week.push(day);
  }

  return { week, year, month };
}
