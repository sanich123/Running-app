import { getCurrentPositionAsync, getLastKnownPositionAsync } from 'expo-location';
import { getCurrentOrLastKnownPosition } from './get-initial-position';
import type { LocationObject } from 'expo-location';

jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
}));

describe('getCurrentOrLastKnownPosition', () => {
  const currentPosition = { coords: { latitude: 55.75, longitude: 37.61 } } as LocationObject;
  const lastKnownPosition = { coords: { latitude: 55.76, longitude: 37.62 } } as LocationObject;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the current position when it is available', async () => {
    (getCurrentPositionAsync as jest.Mock).mockResolvedValue(currentPosition);

    await expect(getCurrentOrLastKnownPosition()).resolves.toBe(currentPosition);
    expect(getCurrentPositionAsync).toHaveBeenCalledWith({ accuracy: 6 });
    expect(getLastKnownPositionAsync).not.toHaveBeenCalled();
  });

  it('falls back to the last known position when current position is unavailable', async () => {
    (getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('GPS unavailable'));
    (getLastKnownPositionAsync as jest.Mock).mockResolvedValue(lastKnownPosition);

    await expect(getCurrentOrLastKnownPosition()).resolves.toBe(lastKnownPosition);
    expect(getLastKnownPositionAsync).toHaveBeenCalledTimes(1);
  });

  it('returns null when there is no current or last known position', async () => {
    (getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('GPS unavailable'));
    (getLastKnownPositionAsync as jest.Mock).mockResolvedValue(null);

    await expect(getCurrentOrLastKnownPosition()).resolves.toBeNull();
  });
});
