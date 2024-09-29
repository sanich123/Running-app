import { LANGUAGES } from '@const/enums';

export function mapNumberToMonth(number: number, language: LANGUAGES) {
  const mapNumToMonth = new Map();
  const monthsInRussian = ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'A', 'C', 'О', 'Н', 'Д'];
  const monthsInEnglish = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

  [...Array(12).keys()].map((_, i) =>
    mapNumToMonth.set(i, language === LANGUAGES.english ? monthsInEnglish[i] : monthsInRussian[i]),
  );
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
