import type { ProfileType } from '@S/card/types';

const profileDataKeys: (keyof ProfileType)[] = [
  'bio',
  'birthday',
  'city',
  'gender',
  'name',
  'profilePhoto',
  'sport',
  'surname',
  'weight',
];

export function hasProfileData(profile?: Partial<ProfileType> | null) {
  return Boolean(profile && profileDataKeys.some((key) => Boolean(profile[key])));
}
