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
} as const;

export function limitText(value: string, maxLength: number) {
  return value.slice(0, maxLength);
}

export function normalizeWeightInput(value: string) {
  return value.replace(/\D/g, '').slice(0, PROFILE_INPUT_LIMITS.weight);
}
