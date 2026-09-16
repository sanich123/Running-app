import { useLocalSearchParams, useRouter } from 'expo-router';
import { PROFILE_INPUT_LIMITS, limitText, normalizeWeightInput } from '@const/input-limits';
import type { ProfileType } from '@S/card/types';

export interface ProfileFormValues {
  name: string;
  surname: string;
  weight: string;
  city: string;
  bio: string;
  gender: string;
}

export interface ProfileSettingsSearchParams {
  name?: string | string[];
  surname?: string | string[];
  weight?: string | string[];
  city?: string | string[];
  bio?: string | string[];
  gender?: string | string[];
  profileSettingsInitialized?: string | string[];
}

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function getProfileFormValues(params: Partial<ProfileSettingsSearchParams>): ProfileFormValues {
  return {
    name: limitText(getFirstParam(params.name) ?? '', PROFILE_INPUT_LIMITS.name),
    surname: limitText(getFirstParam(params.surname) ?? '', PROFILE_INPUT_LIMITS.surname),
    weight: normalizeWeightInput(getFirstParam(params.weight) ?? ''),
    city: limitText(getFirstParam(params.city) ?? '', PROFILE_INPUT_LIMITS.city),
    bio: limitText(getFirstParam(params.bio) ?? '', PROFILE_INPUT_LIMITS.bio),
    gender: getFirstParam(params.gender) ?? '',
  };
}

export function getInitialProfileSettingsParams(profile: ProfileType) {
  return {
    name: limitText(profile.name ?? '', PROFILE_INPUT_LIMITS.name),
    surname: limitText(profile.surname ?? '', PROFILE_INPUT_LIMITS.surname),
    weight: normalizeWeightInput(profile.weight ?? ''),
    city: limitText(profile.city ?? '', PROFILE_INPUT_LIMITS.city),
    bio: limitText(profile.bio ?? '', PROFILE_INPUT_LIMITS.bio),
    gender: profile.gender ?? '',
  };
}

export function useProfileFormParams() {
  return getProfileFormValues(useLocalSearchParams() as Partial<ProfileSettingsSearchParams>);
}

export function useSetProfileFormParams() {
  const { setParams } = useRouter();

  return {
    setName: (name: string) => setParams({ name: limitText(name, PROFILE_INPUT_LIMITS.name) }),
    setSurname: (surname: string) => setParams({ surname: limitText(surname, PROFILE_INPUT_LIMITS.surname) }),
    setWeight: (weight: string) => setParams({ weight: normalizeWeightInput(weight) }),
    setCity: (city: string) => setParams({ city: limitText(city, PROFILE_INPUT_LIMITS.city) }),
    setBio: (bio: string) => setParams({ bio: limitText(bio, PROFILE_INPUT_LIMITS.bio) }),
    setGender: (gender: string) => setParams({ gender }),
  };
}
