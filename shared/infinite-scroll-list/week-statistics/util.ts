export function getCurrentWeekDates(now = new Date()) {
  const currentDate = new Date(now);
  const daysSinceMonday = (currentDate.getDay() + 6) % 7;
  const monday = new Date(currentDate);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(currentDate.getDate() - daysSinceMonday);

  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  return { week, year: currentDate.getFullYear(), month: currentDate.getMonth() };
}
