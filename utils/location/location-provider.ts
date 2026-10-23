import type { LocationObject } from 'expo-location';

export type LocationProvider = string;

type LocationObjectWithProvider = LocationObject & { provider?: unknown };

export function getLocationProvider(location: LocationObject): LocationProvider | null {
  const provider = (location as LocationObjectWithProvider).provider;
  return typeof provider === 'string' ? provider : null;
}

export function stripLocationProvider(location: LocationObject): LocationObject {
  const position = { ...location } as LocationObjectWithProvider;
  delete position.provider;
  return position;
}
