export const ACTIVITY_INPUT_LIMITS = {
  title: 80,
  description: 500,
} as const;

export const PROFILE_INPUT_LIMITS = {
  name: 50,
  surname: 50,
  city: 100,
  bio: 500,
  weight: 3,
  height: 3,
  age: 3,
} as const;

export const PROFILE_VALUE_LIMITS = {
  weight: 200,
  height: 230,
  age: 100,
} as const;

export function limitText(value: string, maxLength: number) {
  return value.slice(0, maxLength);
}

export function normalizeWeightInput(value: string) {
  return normalizeNumericInput(value, PROFILE_INPUT_LIMITS.weight, PROFILE_VALUE_LIMITS.weight);
}

export function normalizeHeightInput(value: string) {
  return normalizeNumericInput(value, PROFILE_INPUT_LIMITS.height, PROFILE_VALUE_LIMITS.height);
}

export function normalizeAgeInput(value: string) {
  return normalizeNumericInput(value, PROFILE_INPUT_LIMITS.age, PROFILE_VALUE_LIMITS.age);
}

function normalizeNumericInput(value: string, maxLength: number, maxValue: number) {
  const digits = value.replace(/\D/g, '').slice(0, maxLength);
  if (!digits) return '';
  return Number(digits) > maxValue ? String(maxValue) : digits;
}
