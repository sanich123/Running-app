import type { ReactNode } from 'react';
import { screen, userEvent } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import MapsPage from './maps-page';

const mockPush = jest.fn();
const mockGetPacks = jest.fn();
const mockListSavedOfflineMaps = jest.fn();
const mockListTracks = jest.fn();

jest.mock('expo-router', () => ({
  Stack: Object.assign(() => null, {
    Screen: ({ options }: { options?: { headerRight?: () => ReactNode } }) => options?.headerRight?.() ?? null,
  }),
  useRouter: () => ({ push: mockPush }),
}));
jest.mock('@rnmapbox/maps', () => ({
  __esModule: true,
  default: { offlineManager: { getPacks: (...args: unknown[]) => mockGetPacks(...args) } },
}));
jest.mock('@U/offline-map-library', () => ({
  listSavedOfflineMaps: (...args: unknown[]) => mockListSavedOfflineMaps(...args),
  subscribeToOfflineMaps: () => undefined,
}));
jest.mock('@U/activity-track/track-library', () => ({
  getSavedActivityTracksStorageBytes: () => 0,
  listSavedActivityTracks: (...args: unknown[]) => mockListTracks(...args),
  subscribeToSavedActivityTracks: () => undefined,
}));

const savedTrack = {
  id: 'activity-run-1',
  activityId: 'run-1',
  title: 'Morning run',
  date: '2026-10-29T06:00:00.000Z',
  pointCount: 245,
  distanceMeters: 5200,
  sport: 'running',
};

describe('maps page', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockGetPacks.mockReset().mockResolvedValue([]);
    mockListSavedOfflineMaps.mockReset().mockResolvedValue([]);
    mockListTracks.mockReset().mockResolvedValue([savedTrack]);
  });

  it('opens the routes page with saved tracks', async () => {
    await renderWithProviders(<MapsPage mode="routes" />);

    expect(await screen.findByTestId(`saved-track-${savedTrack.id}`)).toBeOnTheScreen();
    expect(screen.getByText(savedTrack.title)).toBeOnTheScreen();
  });

  it('opens the maps page with downloaded offline maps', async () => {
    mockGetPacks.mockResolvedValue([{ name: 'region-1', status: async () => ({ completedResourceSize: 1024 }) }]);
    mockListSavedOfflineMaps.mockResolvedValue([{ id: 'region-1', title: 'Moscow' }]);
    await renderWithProviders(<MapsPage mode="maps" />);

    expect(await screen.findByText('Moscow')).toBeOnTheScreen();
    expect(screen.getAllByText('1 KB')).toHaveLength(2);
  });

  it('opens track addition from the routes page', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<MapsPage mode="routes" />);

    await user.press(screen.getByTestId('routes-add-action'));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.addTrack}`);
  });

  it('opens offline map creation from the maps page', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<MapsPage mode="maps" />);

    await user.press(screen.getByTestId('maps-add-action'));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.createOfflineMap}`);
  });
});
