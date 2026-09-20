import {
  ACTIVITY_INPUT_LIMITS,
  PROFILE_INPUT_LIMITS,
  limitText,
  normalizeAgeInput,
  normalizeHeightInput,
  normalizeWeightInput,
} from './input-limits';

describe('input limits', () => {
  it('limits text by the configured field length', () => {
    const value = 'x'.repeat(ACTIVITY_INPUT_LIMITS.title + 10);

    expect(limitText(value, ACTIVITY_INPUT_LIMITS.title)).toHaveLength(ACTIVITY_INPUT_LIMITS.title);
    expect(limitText('город', PROFILE_INPUT_LIMITS.city)).toBe('город');
  });

  it('keeps only a short numeric weight value', () => {
    expect(normalizeWeightInput('70kg')).toBe('70');
    expect(normalizeWeightInput('1a2.5')).toBe('125');
    expect(normalizeWeightInput('1234')).toBe('123');
    expect(normalizeWeightInput('201')).toBe('200');
    expect(normalizeHeightInput('231')).toBe('230');
    expect(normalizeAgeInput('101')).toBe('100');
  });
});
