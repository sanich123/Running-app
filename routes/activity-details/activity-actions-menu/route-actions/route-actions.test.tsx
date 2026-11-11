import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Platform } from 'react-native';
import { MOCK_SERVER_ACTIVITY } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import MenuView from '../menu-view/menu-view';
import ActivityRouteActions from './route-actions';
import type { ActivityResponse } from '@R/runich-api/activity-types';

const mockPush = jest.fn();
const mockShareAsync = jest.fn();
const mockSaveActivityTrack = jest.fn();
const mockGetSavedActivityTrackFile = jest.fn();
const originalPlatformOS = Platform.OS;

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: (...args: unknown[]) => mockShareAsync(...args),
}));
jest.mock('@U/activity-track/track-library', () => ({
  getActivityTrackExportFilename: () => '2026-11-01_run_15-55-38.gpx',
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
    const requests: string[] = [];
    server.use(
      http.get(`${BASE_URL}/activity/${activity.id}/locations`, ({ request }) => {
        requests.push(request.url);
        return HttpResponse.json({ locations: rawLocations });
      }),
    );
    const user = await openRouteActionMenu();
    await user.press(screen.getByTestId('activity-actions-menu-download-gpx'));

    await waitFor(() =>
      expect(mockShareAsync).toHaveBeenCalledWith(
        'file:///activity-route',
        expect.objectContaining({ mimeType: 'application/gpx+xml' }),
      ),
    );
    expect(requests).toEqual([`${BASE_URL}/activity/${activity.id}/locations?raw=true`]);
    expect(mockSaveActivityTrack).toHaveBeenCalledWith(
      expect.objectContaining({ activityId: activity.id, locations: rawLocations }),
    );
  });

  it('starts navigation with a locally saved copy of the full route', async () => {
    const requests: string[] = [];
    server.use(
      http.get(`${BASE_URL}/activity/${activity.id}/locations`, ({ request }) => {
        requests.push(request.url);
        return HttpResponse.json({ locations: rawLocations });
      }),
    );
    const user = await openRouteActionMenu();
    await user.press(screen.getByTestId('activity-actions-menu-navigate'));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/(tabs)/activity'));
    expect(mockStore.getState().location.navigationTrackId).toBe(`activity-${activity.id}`);
    expect(requests).toEqual([`${BASE_URL}/activity/${activity.id}/locations?raw=true`]);
  });
});
