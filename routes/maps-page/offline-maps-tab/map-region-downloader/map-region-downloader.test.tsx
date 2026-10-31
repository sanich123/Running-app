import type React from 'react';
import { act, fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import * as errorToastModule from '@S/error-toast/error-toast';
import { renderWithProviders } from '@T/utils/test-utils';
import MapRegionDownloader from './map-region-downloader';
import { MAPS_PAGE_COPY } from '../../const';

const mockCreatePack = jest.fn();
const mockDeletePack = jest.fn();
const mockGetVisibleBounds = jest.fn();
const mockSaveOfflineMap = jest.fn();
const mockRemoveOfflineMap = jest.fn();

jest.mock('@rnmapbox/maps', () => {
  const ReactModule = jest.requireActual('react') as typeof React;
  const { View } = jest.requireActual('react-native') as {
    View: React.ComponentType<React.PropsWithChildren<{ testID?: string }>>;
  };
  const MockMapView = ReactModule.forwardRef<
    { getVisibleBounds: () => Promise<[[number, number], [number, number]]> },
    { children?: React.ReactNode; onMapIdle?: () => void; testID?: string }
  >(({ children, onMapIdle, testID }, ref) => {
    ReactModule.useImperativeHandle(ref, () => ({ getVisibleBounds: mockGetVisibleBounds }));
    ReactModule.useEffect(() => {
      onMapIdle?.();
    }, [onMapIdle]);
    return ReactModule.createElement(View, { testID }, children);
  });
  return {
    __esModule: true,
    default: {
      offlineManager: {
        createPack: (...args: unknown[]) => mockCreatePack(...args),
        deletePack: (...args: unknown[]) => mockDeletePack(...args),
      },
    },
    Camera: View,
    MapView: MockMapView,
    UserLocation: View,
  };
});
jest.mock('@U/offline-map-library', () => ({
  removeOfflineMap: (...args: unknown[]) => mockRemoveOfflineMap(...args),
  saveOfflineMap: (...args: unknown[]) => mockSaveOfflineMap(...args),
}));

const copy = MAPS_PAGE_COPY[LANGUAGES.russian];

describe('map region downloader', () => {
  beforeEach(() => {
    mockCreatePack.mockReset();
    mockDeletePack.mockReset();
    mockDeletePack.mockResolvedValue(undefined);
    mockGetVisibleBounds.mockReset();
    mockGetVisibleBounds.mockResolvedValue([
      [38, 56],
      [37, 55],
    ]);
    mockSaveOfflineMap.mockReset();
    mockSaveOfflineMap.mockResolvedValue([]);
    mockRemoveOfflineMap.mockReset();
    mockRemoveOfflineMap.mockResolvedValue([]);
  });

  it('downloads the visible region under the entered name and refreshes the map list', async () => {
    mockCreatePack.mockImplementation((_options: unknown, onProgress: (pack: object, status: object) => void) => {
      onProgress({}, { state: 'complete', percentage: 100 });
      return Promise.resolve();
    });
    const onDownloaded = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    await renderWithProviders(
      <MapRegionDownloader centerCoordinate={[37.6, 55.7]} copy={copy} onDownloaded={onDownloaded} />,
    );
    await act(async () => Promise.resolve());
    await user.type(screen.getByTestId('offline-region-name'), 'Москва');
    await user.press(screen.getByTestId('download-offline-region'));

    await waitFor(() => expect(mockSaveOfflineMap).toHaveBeenCalledWith(expect.objectContaining({ title: 'Москва' })));
    expect(mockCreatePack).toHaveBeenCalledWith(
      expect.objectContaining({
        bounds: [
          [38, 56],
          [37, 55],
        ],
        minZoom: 6,
        maxZoom: 16,
      }),
      expect.any(Function),
      expect.any(Function),
    );
    expect(onDownloaded).toHaveBeenCalledTimes(1);
  });

  it('deletes the offline pack when the user cancels a download', async () => {
    mockCreatePack.mockResolvedValue(undefined);
    const onDownloaded = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    await renderWithProviders(
      <MapRegionDownloader centerCoordinate={[37.6, 55.7]} copy={copy} onDownloaded={onDownloaded} />,
    );
    await act(async () => Promise.resolve());
    fireEvent(screen.getByTestId('offline-region-map'), 'layout');
    await user.type(screen.getByTestId('offline-region-name'), 'Test area');
    await user.press(screen.getByTestId('download-offline-region'));
    await user.press(screen.getByTestId('cancel-offline-map-download'));

    await waitFor(() => expect(mockDeletePack).toHaveBeenCalledTimes(1));
    expect(mockRemoveOfflineMap).toHaveBeenCalledWith(expect.any(String));
  });

  it('reports the pack name, progress, style, zoom and bounds when Mapbox rejects a download', async () => {
    const errorToastSpy = jest.spyOn(errorToastModule, 'errorToast');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockCreatePack.mockImplementation(
      (
        _options: unknown,
        onProgress: (pack: object, status: object) => void,
        onError: (pack: object, error: { name: string; message: string }) => void,
      ) => {
        onProgress(
          {},
          {
            state: 'active',
            percentage: 17,
            completedResourceCount: 9,
            erroredResourceCount: 2,
            requiredResourceCount: 53,
            loadedResourceCount: 44,
          },
        );
        onError({}, { name: 'region-pack-400', message: 'Tile request failed' });
        return Promise.resolve();
      },
    );
    const user = userEvent.setup();
    await renderWithProviders(
      <MapRegionDownloader
        centerCoordinate={[37.6, 55.7]}
        copy={copy}
        initialVisibleBounds={[
          [38, 56],
          [37, 55],
        ]}
      />,
    );
    await user.type(screen.getByTestId('offline-region-name'), 'Moscow');
    await user.press(screen.getByTestId('download-offline-region'));

    await waitFor(() => expect(errorToastSpy).toHaveBeenCalledWith(copy.mapDownloadFailed, expect.any(Error)));
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('id=region-pack-400; ресурсы 9/53, ошибок 2, загружено 44; map; zoom 6–16'),
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('boundsValid=true, order=northEast,southWest'),
    );
    expect(mockDeletePack).toHaveBeenCalledWith(expect.stringContaining('runich-region-'));
    expect(mockRemoveOfflineMap).toHaveBeenCalledWith(expect.stringContaining('runich-region-'));
    errorToastSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('keeps an embedded downloader on the workout page and requires a region name', async () => {
    await renderWithProviders(
      <MapRegionDownloader centerCoordinate={[37.6, 55.7]} copy={copy} embedded initialVisibleBounds={null} />,
    );

    expect(screen.queryByTestId('offline-region-map')).toBeNull();
    expect(screen.queryByTestId('toggle-map-style')).toBeNull();
    expect(screen.getByText(copy.mapRegionInfo)).toBeOnTheScreen();
    expect(screen.getByTestId('download-offline-region').props.accessibilityState.disabled).toBe(true);
  });
});
