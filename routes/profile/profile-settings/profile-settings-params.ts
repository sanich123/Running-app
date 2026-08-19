import { useLocalSearchParams, useRouter } from 'expo-router';
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
    name: getFirstParam(params.name) ?? '',
    surname: getFirstParam(params.surname) ?? '',
    weight: getFirstParam(params.weight) ?? '',
    city: getFirstParam(params.city) ?? '',
    bio: getFirstParam(params.bio) ?? '',
    gender: getFirstParam(params.gender) ?? '',
  };
}

export function getInitialProfileSettingsParams(profile: ProfileType) {
  return {
    name: profile.name ?? '',
    surname: profile.surname ?? '',
    weight: profile.weight ?? '',
    city: profile.city ?? '',
    bio: profile.bio ?? '',
    gender: profile.gender ?? '',
  };
}

export function useProfileFormParams() {
  return getProfileFormValues(useLocalSearchParams() as Partial<ProfileSettingsSearchParams>);
}

export function useSetProfileFormParams() {
  const { setParams } = useRouter();

  return {
    setName: (name: string) => setParams({ name }),
    setSurname: (surname: string) => setParams({ surname }),
    setWeight: (weight: string) => setParams({ weight }),
    setCity: (city: string) => setParams({ city }),
    setBio: (bio: string) => setParams({ bio }),
    setGender: (gender: string) => setParams({ gender }),
  };
}
