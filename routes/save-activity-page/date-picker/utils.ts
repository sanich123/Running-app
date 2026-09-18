export function clampDateToMaximum(date: Date, maximumDate?: Date) {
  return maximumDate && date > maximumDate ? maximumDate : date;
}
