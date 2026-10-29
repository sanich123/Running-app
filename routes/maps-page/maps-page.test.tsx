import type React from 'react';
import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { setNavigationTrackId } from '@R/slices/location/location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { MAPS_PAGE_COPY } from './const';
import MapsPage from './maps-page';

const mockPush = jest.fn();
const mockGetOfflinePacks = jest.fn();
const mockListOfflineMaps = jest.fn();
const mockRenameOfflineMap = jest.fn();
const mockListTracks = jest.fn();
const mockRenameTrack = jest.fn();
const mockSaveTrack = jest.fn();
const mockSetCamera = jest.fn();
const mockPickDocument = jest.fn();
const mockReadFile = jest.fn();
const mockErrorToast = jest.fn();

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: mockPush }),
}));
jest.mock('@rnmapbox/maps', () => {
  const ReactModule = jest.requireActual('react') as typeof React;
  const { View: NativeView } = jest.requireActual('react-native') as {
    View: React.ComponentType<React.PropsWithChildren<{ testID?: string }>>;
  };
  const Camera = ReactModule.forwardRef((_props: unknown, ref: React.Ref<unknown>) => {
    ReactModule.useImperativeHandle(ref, () => ({ setCamera: mockSetCamera }));
    return <NativeView testID="maps-page-camera" />;
  });
  return {
    __esModule: true,
    default: { offlineManager: { getPacks: () => mockGetOfflinePacks() } },
    Camera,
    MapView: NativeView,
    UserLocation: NativeView,
  };
});
jest.mock('expo-document-picker', () => ({ getDocumentAsync: (...args: unknown[]) => mockPickDocument(...args) }));
jest.mock('expo-file-system', () => ({ File: jest.fn(() => ({ text: () => mockReadFile() })) }));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: (...args: unknown[]) => mockErrorToast(...args) }));
jest.mock('@U/offline-map-library', () => ({
  listSavedOfflineMaps: () => mockListOfflineMaps(),
  removeOfflineMap: jest.fn(),
  renameOfflineMap: (...args: unknown[]) => mockRenameOfflineMap(...args),
  saveOfflineMap: jest.fn(),
}));
jest.mock('@U/activity-track/track-library', () => ({
  deleteSavedActivityTrack: jest.fn(),
  getSavedActivityTrackFile: jest.fn(),
  listSavedActivityTracks: () => mockListTracks(),
  readSavedActivityTrack: jest.fn(),
  renameSavedActivityTrack: (...args: unknown[]) => mockRenameTrack(...args),
  saveActivityTrack: (...args: unknown[]) => mockSaveTrack(...args),
}));

const copy = MAPS_PAGE_COPY[LANGUAGES.russian];
const offlineMap = { id: 'runich-region-moscow', title: 'Москва' };
const savedTrack = {
  id: 'activity-run-1',
  activityId: 'run-1',
  title: 'Утренняя пробежка',
  date: '2026-10-29T06:00:00.000Z',
  pointCount: 245,
};

describe('maps page', () => {
  beforeEach(() => {
    mockStore.dispatch(setNavigationTrackId(null));
    mockGetOfflinePacks.mockReset().mockResolvedValue([{ name: offlineMap.id }]);
    mockListOfflineMaps.mockReset().mockResolvedValue([offlineMap]);
    mockRenameOfflineMap.mockReset().mockResolvedValue([{ ...offlineMap, title: 'Центр Москвы' }]);
    mockListTracks.mockReset().mockResolvedValue([savedTrack]);
    mockRenameTrack.mockReset();
    mockSaveTrack.mockReset().mockResolvedValue(savedTrack);
    mockSetCamera.mockReset();
    mockPickDocument.mockReset();
    mockReadFile
      .mockReset()
      .mockResolvedValue(
        '<gpx><trk><name>Импортированный</name><trkseg><trkpt lat="55.7" lon="37.6"/><trkpt lat="55.8" lon="37.7"/></trkseg></trk></gpx>',
      );
    mockPush.mockReset();
    mockErrorToast.mockReset();
  });

  async function renderMapsPage() {
    await renderWithProviders(<MapsPage />, { store: mockStore });
    await act(async () => Promise.resolve());
  }

  it('shows the full map, primary map actions and floating controls without route creation', async () => {
    await renderMapsPage();

    expect(screen.getByTestId('maps-page-map')).toBeOnTheScreen();
    expect(screen.getByText(copy.title)).toBeOnTheScreen();
    expect(screen.getByTestId('import-map-route')).toBeOnTheScreen();
    expect(screen.getByTestId('download-offline-maps')).toBeOnTheScreen();
    expect(screen.getByTestId('toggle-map-style')).toBeOnTheScreen();
    expect(screen.getByTestId('toggle-map-pitch')).toBeOnTheScreen();
    expect(screen.queryByText(/Создать маршрут/)).not.toBeOnTheScreen();
  });

  it('toggles map style and perspective and recenters on the current location', async () => {
    const user = userEvent.setup();
    await renderMapsPage();

    await user.press(screen.getByTestId('toggle-map-style'));
    expect(screen.getByLabelText(copy.street)).toBeOnTheScreen();
    await user.press(screen.getByTestId('toggle-map-pitch'));
    expect(screen.getByLabelText(copy.switchTo3d)).toBeOnTheScreen();
    await user.press(screen.getByTestId('center-map-on-location'));

    expect(mockSetCamera).toHaveBeenCalledWith({
      centerCoordinate: [37.6173, 55.7558],
      zoomLevel: 15,
      animationDuration: 650,
    });
  });

  it('opens the saved maps panel and lets the user rename an offline map', async () => {
    const user = userEvent.setup();
    await renderMapsPage();
    await user.press(screen.getByTestId('download-offline-maps'));

    expect(await screen.findByText('Москва')).toBeOnTheScreen();
    await user.press(screen.getByLabelText(copy.rename));
    const titleInput = screen.getByDisplayValue('Москва');
    await user.clear(titleInput);
    await user.type(titleInput, 'Центр Москвы');
    await user.press(screen.getByLabelText(copy.save));

    await waitFor(() => expect(mockRenameOfflineMap).toHaveBeenCalledWith(offlineMap.id, 'Центр Москвы'));
    expect(await screen.findByText('Центр Москвы')).toBeOnTheScreen();
  });

  it('opens saved tracks and starts navigation for the selected track', async () => {
    const user = userEvent.setup();
    await renderMapsPage();
    await user.press(screen.getByTestId('show-saved-tracks'));

    expect(await screen.findByText(savedTrack.title)).toBeOnTheScreen();
    await user.press(screen.getByTestId(`navigate-saved-track-${savedTrack.id}`));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.tabs}/${ROUTES.activity}`));
    expect(mockStore.getState().location.navigationTrackId).toBe(savedTrack.id);
  });

  it('opens the dedicated favorite-workouts page', async () => {
    const user = userEvent.setup();
    await renderMapsPage();
    await user.press(screen.getByTestId('show-favorite-activities'));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.favoriteActivities}`);
  });

  it('imports a GPX route into the local track library', async () => {
    mockPickDocument.mockResolvedValue({
      canceled: false,
      assets: [{ name: 'Moscow.gpx', uri: 'file:///moscow.gpx' }],
    });
    const user = userEvent.setup();
    await renderMapsPage();
    await user.press(screen.getByTestId('import-map-route'));

    await waitFor(() =>
      expect(mockSaveTrack).toHaveBeenCalledWith(expect.objectContaining({ title: 'Импортированный' })),
    );
    expect(mockSaveTrack.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        locations: expect.arrayContaining([expect.objectContaining({ coords: { latitude: 55.7, longitude: 37.6 } })]),
      }),
    );
  });

  it('does not save a route when file picking is cancelled', async () => {
    mockPickDocument.mockResolvedValue({ canceled: true, assets: [] });
    const user = userEvent.setup();
    await renderMapsPage();
    await user.press(screen.getByTestId('import-map-route'));

    await waitFor(() => expect(mockPickDocument).toHaveBeenCalledTimes(1));
    expect(mockSaveTrack).not.toHaveBeenCalled();
  });

  it('rejects a file with an unsupported extension', async () => {
    mockPickDocument.mockResolvedValue({ canceled: false, assets: [{ name: 'route.txt', uri: 'file:///route.txt' }] });
    const user = userEvent.setup();
    await renderMapsPage();
    await user.press(screen.getByTestId('import-map-route'));

    await waitFor(() => expect(mockErrorToast).toHaveBeenCalledWith(copy.unsupportedRoute));
    expect(mockSaveTrack).not.toHaveBeenCalled();
  });
});
