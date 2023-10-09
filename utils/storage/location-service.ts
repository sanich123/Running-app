import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationObject } from 'expo-location';

export const LOCATION_STORAGE = 'locations';

export async function getLocations(): Promise<LocationObject[]> {
  const data = await AsyncStorage.getItem(LOCATION_STORAGE);
  return data ? JSON.parse(data) : [];
}

export async function setLocations(locations: LocationObject[]): Promise<void> {
  await AsyncStorage.setItem(LOCATION_STORAGE, JSON.stringify(locations));
}

export async function addLocation(location: LocationObject): Promise<LocationObject[]> {
  const existing = await getLocations();
  const locations = [...existing, location];
  await setLocations(locations);
  console.log('[storage]', 'added location -', locations.length, 'stored locations');
  return locations;
}

export async function clearLocations(): Promise<void> {
  await AsyncStorage.removeItem(LOCATION_STORAGE);
  console.log('[storage]', 'cleared locations');
}
