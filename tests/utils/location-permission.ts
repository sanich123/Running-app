import { PermissionStatus } from 'expo-location';
import type { LocationPermissionResponse } from 'expo-location';

export function makeLocationPermissionResponse(granted: boolean): LocationPermissionResponse {
  return {
    canAskAgain: true,
    expires: 'never',
    granted,
    status: granted ? PermissionStatus.GRANTED : PermissionStatus.DENIED,
  };
}
