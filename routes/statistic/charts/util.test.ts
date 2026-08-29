import { LANGUAGES } from '@const/enums';
import { getMathRoundValueOrZero, getSteps, mapNumberToMonth } from './util';

describe('chart utilities', () => {
  it('maps supported and unsupported months for both languages', () => {
    expect(mapNumberToMonth(0, LANGUAGES.english)).toBe('J');
    expect(mapNumberToMonth(0, LANGUAGES.russian)).toBe('Я');
    expect(mapNumberToMonth(12, LANGUAGES.english)).toBe('');
  });

  it('rounds values and replaces zero with zero', () => {
    expect(getMathRoundValueOrZero(4.6)).toBe(5);
    expect(getMathRoundValueOrZero(0)).toBe(0);
  });

  it('builds chart steps for empty, one-digit, two-digit and three-digit values', () => {
    expect(getSteps(0)).toEqual({ steps: ['0', '1'], maxValue: 1, noOfSections: 1 });
    expect(getSteps(7)).toEqual({ steps: ['0', '5'], maxValue: 10, noOfSections: 2 });
    expect(getSteps(42)).toEqual({ steps: ['0', '10', '20', '30', '40'], maxValue: 50, noOfSections: 5 });
    expect(getSteps(123)).toEqual({ steps: ['0', '100'], maxValue: 200, noOfSections: 2 });
  });
});
