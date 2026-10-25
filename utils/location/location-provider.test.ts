import { getLocationProvider, stripLocationProvider } from './location-provider';
import type { LocationObject } from 'expo-location';

const location = {
  coords: {
    latitude: 55.75,
    longitude: 37.61,
    altitude: null,
    accuracy: 5,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp: 1,
} satisfies LocationObject;

describe('location provider compatibility', () => {
  it('reads and strips the legacy provider field without changing coordinates', () => {
    const withProvider = { ...location, provider: 'google-play-services' as const };

    expect(getLocationProvider(withProvider)).toBe('google-play-services');
    expect(stripLocationProvider(withProvider)).toEqual(location);
    expect(withProvider.provider).toBe('google-play-services');
  });

  it('returns null when the Expo location object has no provider', () => {
    expect(getLocationProvider(location)).toBeNull();
    expect(stripLocationProvider(location)).toEqual(location);
  });
});
