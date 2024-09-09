export function getCurrentWeekDates() {
  let curr = new Date();
  let week = [];

  for (let i = 1; i <= 7; i++) {
    let first = curr.getDate() - curr.getDay() + i;
    let day = new Date(curr.setDate(first)).toDateString();
    week.push(day);
  }

  return week;
}
