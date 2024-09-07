export function mapNumberToMonth(number: number) {
  const mapNumToMonth = new Map();
  const months = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  [...Array(12).keys()].map((_, i) => mapNumToMonth.set(i, months[i]));
  if (mapNumToMonth.has(number)) {
    return mapNumToMonth.get(number);
  }
  return '';
}

export function getMathRoundValueOrZero(value: number) {
  if (value) {
    return Math.round(value);
  }
  return 0;
}
export function getSteps(maxValue: number) {
  const lengthOfMaxValue = maxValue.toString().length;
  if (lengthOfMaxValue === 1) {
    return { steps: ['0', '5'], maxValue: 10, noOfSections: 2 };
  } else {
    const divider = lengthOfMaxValue === 3 ? 100 : 10;
    const step = Math.floor(maxValue / divider) + 1;
    const maxRenderedValue = step * divider;
    const steps = [...Array(step).keys()].map((key) => `${key * divider}`);

    return { steps, maxValue: maxRenderedValue, noOfSections: steps.length };
  }
}
