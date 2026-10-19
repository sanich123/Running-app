import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  PROFILE_INPUT_LIMITS,
  limitText,
  normalizeAgeInput,
  normalizeHeightInput,
  normalizeMaxHeartRateInput,
  normalizeRestingHeartRateInput,
  normalizeWeightInput,
} from '@const/input-limits';
import type { ProfileType } from '@S/card/types';

interface ProfileFormValues {
  name: string;
  surname: string;
  weight: string;
  height: string;
  age: string;
  city: string;
  bio: string;
  gender: string;
  restingHeartRate: string;
  maxHeartRate: string;
}

export interface ProfileSettingsSearchParams {
  name?: string | string[];
  surname?: string | string[];
  weight?: string | string[];
  height?: string | string[];
  age?: string | string[];
  city?: string | string[];
  bio?: string | string[];
  gender?: string | string[];
  restingHeartRate?: string | string[];
  maxHeartRate?: string | string[];
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
    height: normalizeHeightInput(getFirstParam(params.height) ?? ''),
    age: normalizeAgeInput(getFirstParam(params.age) ?? ''),
    city: limitText(getFirstParam(params.city) ?? '', PROFILE_INPUT_LIMITS.city),
    bio: limitText(getFirstParam(params.bio) ?? '', PROFILE_INPUT_LIMITS.bio),
    gender: getFirstParam(params.gender) ?? '',
    restingHeartRate: normalizeRestingHeartRateInput(getFirstParam(params.restingHeartRate) ?? ''),
    maxHeartRate: normalizeMaxHeartRateInput(getFirstParam(params.maxHeartRate) ?? ''),
  };
}

export function getInitialProfileSettingsParams(profile: ProfileType) {
  return {
    name: limitText(profile.name ?? '', PROFILE_INPUT_LIMITS.name),
    surname: limitText(profile.surname ?? '', PROFILE_INPUT_LIMITS.surname),
    weight: normalizeWeightInput(profile.weight ?? ''),
    height: normalizeHeightInput(profile.height ?? ''),
    age: normalizeAgeInput(profile.age ?? ''),
    city: limitText(profile.city ?? '', PROFILE_INPUT_LIMITS.city),
    bio: limitText(profile.bio ?? '', PROFILE_INPUT_LIMITS.bio),
    gender: profile.gender ?? '',
    restingHeartRate: normalizeRestingHeartRateInput(profile.restingHeartRate ?? ''),
    maxHeartRate: normalizeMaxHeartRateInput(profile.maxHeartRate ?? ''),
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
    setHeight: (height: string) => setParams({ height: normalizeHeightInput(height) }),
    setAge: (age: string) => setParams({ age: normalizeAgeInput(age) }),
    setRestingHeartRate: (restingHeartRate: string) =>
      setParams({ restingHeartRate: normalizeRestingHeartRateInput(restingHeartRate) }),
    setMaxHeartRate: (maxHeartRate: string) => setParams({ maxHeartRate: normalizeMaxHeartRateInput(maxHeartRate) }),
    setCity: (city: string) => setParams({ city: limitText(city, PROFILE_INPUT_LIMITS.city) }),
    setBio: (bio: string) => setParams({ bio: limitText(bio, PROFILE_INPUT_LIMITS.bio) }),
    setGender: (gender: string) => setParams({ gender }),
  };
}
