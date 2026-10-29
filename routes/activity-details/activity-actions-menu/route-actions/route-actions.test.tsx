import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { MOCK_SERVER_ACTIVITY } from '@T/responses/runich';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityRouteActions from './route-actions';
import MenuView from '../menu-view/menu-view';
import type { ActivityResponse } from '@R/runich-api/types';

const mockGetLocations = jest.fn();
const mockPush = jest.fn();
const mockShareAsync = jest.fn();
const mockSaveActivityTrack = jest.fn();
const mockGetSavedActivityTrackFile = jest.fn();
const originalPlatformOS = Platform.OS;

jest.mock('@R/services/activity/activity', () => ({
  useLazyGetLocationsByActivityIdQuery: () => [mockGetLocations],
}));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: (...args: unknown[]) => mockShareAsync(...args),
}));
jest.mock('@U/activity-track/track-library', () => ({
  getSavedActivityTrackFile: (...args: unknown[]) => mockGetSavedActivityTrackFile(...args),
  saveActivityTrack: (...args: unknown[]) => mockSaveActivityTrack(...args),
}));

const activity = MOCK_SERVER_ACTIVITY as unknown as ActivityResponse;
const rawLocations = [
  { timestamp: 1_000, coords: { latitude: 55.75, longitude: 37.61 } },
  { timestamp: 2_000, coords: { latitude: 55.76, longitude: 37.62 } },
];

describe('activity route actions', () => {
  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockGetLocations.mockReset();
    mockGetLocations.mockReturnValue({ unwrap: () => Promise.resolve({ locations: rawLocations }) });
    mockPush.mockReset();
    mockShareAsync.mockReset();
    mockSaveActivityTrack.mockReset();
    mockSaveActivityTrack.mockResolvedValue({ id: `activity-${activity.id}` });
    mockGetSavedActivityTrackFile.mockReset();
    mockGetSavedActivityTrackFile.mockResolvedValue({ uri: 'file:///activity-route' });
  });

  afterAll(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatformOS });
  });

  async function openRouteActionMenu() {
    const user = userEvent.setup();
    await renderWithProviders(
      <MenuView accessibilityLabel="Workout actions">
        <ActivityRouteActions activity={activity} />
      </MenuView>,
      { store: mockStore },
    );
    await user.press(screen.getByTestId('activity-actions-menu-trigger'));
    return user;
  }

  it('downloads the owner route as GPX through the platform share sheet', async () => {
    const user = await openRouteActionMenu();
    await user.press(screen.getByTestId('activity-actions-menu-download-gpx'));

    await waitFor(() =>
      expect(mockShareAsync).toHaveBeenCalledWith(
        'file:///activity-route',
        expect.objectContaining({ mimeType: 'application/gpx+xml' }),
      ),
    );
    expect(mockGetLocations).toHaveBeenCalledWith({ activityId: activity.id, raw: true });
    expect(mockSaveActivityTrack).toHaveBeenCalledWith(
      expect.objectContaining({ activityId: activity.id, locations: rawLocations }),
    );
  });

  it('starts navigation with a locally saved copy of the full route', async () => {
    const user = await openRouteActionMenu();
    await user.press(screen.getByTestId('activity-actions-menu-navigate'));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/(tabs)/activity'));
    expect(mockStore.getState().location.navigationTrackId).toBe(`activity-${activity.id}`);
    expect(mockGetLocations).toHaveBeenCalledWith({ activityId: activity.id, raw: true });
  });
});
