export function mapNumberToMonth(number: number) {
  const mapNumToMonth = new Map();
  const months = ['ян', 'фв', 'мр', 'ап', 'ма', 'ин', 'ил', 'ав', 'се', 'ок', 'но', 'де'];
  [...Array(12).keys()].map((_, i) => mapNumToMonth.set(i, months[i]));
  if (mapNumToMonth.has(number)) {
    return mapNumToMonth.get(number);
  }
  return '';
}
