import type React from 'react';
import { act, fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { ACTIVITY_ROUTE_REPLAY_MAP_STYLES } from '@S/activity-route-replay/const';
import * as errorToastModule from '@S/error-toast/error-toast';
import { renderWithProviders } from '@T/utils/test-utils';
import MapRegionDownloader from './map-region-downloader';
import { MAPS_PAGE_COPY } from '../../const';

const mockCreatePack = jest.fn();
const mockDeletePack = jest.fn();
const mockGetVisibleBounds = jest.fn();
const mockGetZoom = jest.fn();
const mockSetCamera = jest.fn();
const mockZoomTo = jest.fn();
const mockSaveOfflineMap = jest.fn();
const mockRemoveOfflineMap = jest.fn();

jest.mock('@rnmapbox/maps', () => {
  const ReactModule = jest.requireActual('react') as typeof React;
  const { View } = jest.requireActual('react-native') as {
    View: React.ComponentType<React.PropsWithChildren<{ testID?: string }>>;
  };
  const MockMapView = ReactModule.forwardRef<
    {
      getVisibleBounds: () => Promise<[[number, number], [number, number]]>;
      getZoom: () => Promise<number>;
    },
    { children?: React.ReactNode; onMapIdle?: () => void; testID?: string }
  >(({ children, onMapIdle, testID }, ref) => {
    ReactModule.useImperativeHandle(ref, () => ({ getVisibleBounds: mockGetVisibleBounds, getZoom: mockGetZoom }));
    ReactModule.useEffect(() => {
      onMapIdle?.();
    }, [onMapIdle]);
    return ReactModule.createElement(View, { testID }, children);
  });
  const MockCamera = ReactModule.forwardRef(({ testID }: { testID?: string }, ref: React.ForwardedRef<unknown>) => {
    ReactModule.useImperativeHandle(ref, () => ({ setCamera: mockSetCamera, zoomTo: mockZoomTo }));
    return ReactModule.createElement(View, { testID: testID ?? 'offline-region-camera' });
  });
  const MockShapeSource = ({ id, children }: React.PropsWithChildren<{ id: string }>) =>
    ReactModule.createElement(View, { testID: id }, children);
  const MockLayer = ({ id }: { id: string }) => ReactModule.createElement(View, { testID: id });
  return {
    __esModule: true,
    default: {
      offlineManager: {
        createPack: (...args: unknown[]) => mockCreatePack(...args),
        deletePack: (...args: unknown[]) => mockDeletePack(...args),
      },
    },
    Camera: MockCamera,
    FillLayer: MockLayer,
    LineLayer: MockLayer,
    MapView: MockMapView,
    ShapeSource: MockShapeSource,
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
    mockGetZoom.mockReset().mockResolvedValue(10);
    mockSetCamera.mockReset();
    mockZoomTo.mockReset();
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

  it('downloads the selected area with the satellite style when that style is active', async () => {
    mockCreatePack.mockImplementation((_options: unknown, onProgress: (pack: object, status: object) => void) => {
      onProgress({}, { state: 'complete', percentage: 100 });
      return Promise.resolve();
    });
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
    await user.press(screen.getByTestId('toggle-map-style'));
    await user.type(screen.getByTestId('offline-region-name'), 'Satellite area');
    await user.press(screen.getByTestId('download-offline-region'));

    await waitFor(() =>
      expect(mockCreatePack).toHaveBeenCalledWith(
        expect.objectContaining({
          styleURL: ACTIVITY_ROUTE_REPLAY_MAP_STYLES.satellite,
          metadata: expect.objectContaining({ style: 'satellite' }),
        }),
        expect.any(Function),
        expect.any(Function),
      ),
    );
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

  it('warns that an active download is canceled when the page closes', async () => {
    mockCreatePack.mockImplementation((_options: unknown, onProgress: (pack: object, status: object) => void) => {
      onProgress({}, { state: 'active', percentage: 80 });
      return Promise.resolve();
    });
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
    expect(screen.queryByTestId('offline-map-download-page-warning')).not.toBeOnTheScreen();
    await user.type(screen.getByTestId('offline-region-name'), 'Moscow');
    await user.press(screen.getByTestId('download-offline-region'));

    expect(await screen.findByTestId('offline-map-download-page-warning')).toHaveTextContent(
      copy.mapDownloadRequiresPageOpen,
    );
    expect(screen.getByTestId('offline-map-download-progress')).toBeOnTheScreen();
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

  it('explains how to reduce the area when Mapbox rejects the 750-tile limit', async () => {
    const errorToastSpy = jest.spyOn(errorToastModule, 'errorToast');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockCreatePack.mockImplementation(
      (
        _options: unknown,
        _onProgress: (pack: object, status: object) => void,
        onError: (pack: object, error: { name: string; message: string }) => void,
      ) => {
        onError(
          {},
          {
            name: 'region-pack-limit',
            message:
              "The tile region can't be loaded because it would increase the number of Maps tiles to 1711, which is beyond the maximum allowed 750 tiles.",
          },
        );
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

    await waitFor(() => expect(errorToastSpy).toHaveBeenCalledWith(copy.mapTileLimitExceeded));
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('1711'));
    errorToastSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('reports and cleans up when pack creation rejects before progress starts', async () => {
    const errorToastSpy = jest.spyOn(errorToastModule, 'errorToast');
    mockCreatePack.mockRejectedValue(new Error('Offline pack unavailable'));
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
    expect(mockDeletePack).toHaveBeenCalledWith(expect.stringContaining('runich-region-'));
    expect(mockRemoveOfflineMap).toHaveBeenCalledWith(expect.stringContaining('runich-region-'));
    errorToastSpy.mockRestore();
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

  it.each([
    {
      label: 'saved map',
      previewOnly: true,
      initialBounds: [
        [38, 56],
        [37, 55],
      ] as [[number, number], [number, number]],
    },
    { label: 'download selection', previewOnly: false, initialBounds: null },
  ])('outlines the selected area for a $label', async ({ previewOnly, initialBounds }) => {
    await renderWithProviders(
      <MapRegionDownloader
        centerCoordinate={[37.5, 55.5]}
        copy={copy}
        initialVisibleBounds={initialBounds}
        previewOnly={previewOnly}
        previewTitle="Москва"
      />,
    );

    if (previewOnly) {
      expect(screen.getByTestId('offline-map-region-preview')).toBeOnTheScreen();
      expect(screen.getByTestId('offline-map-region-preview-outline')).toBeOnTheScreen();
    } else {
      await waitFor(() => expect(screen.getByTestId('offline-map-region-preview')).toBeOnTheScreen());
    }
    expect(screen.getByTestId('offline-map-region-preview-fill')).toBeOnTheScreen();
    expect(screen.getByTestId('offline-region-map')).toBeOnTheScreen();
  });

  it('closes a saved-map preview from its close control', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <MapRegionDownloader
        centerCoordinate={[37.5, 55.5]}
        copy={copy}
        initialVisibleBounds={[
          [38, 56],
          [37, 55],
        ]}
        onClose={onClose}
        previewOnly
        previewTitle="Москва"
      />,
    );

    await user.press(screen.getByTestId('close-offline-map-preview'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('clamps zoom-in to Mapbox max zoom and toggles between 2D and 3D pitch', async () => {
    const user = userEvent.setup();
    await renderWithProviders(
      <MapRegionDownloader
        centerCoordinate={[37.5, 55.5]}
        copy={copy}
        initialVisibleBounds={[
          [38, 56],
          [37, 55],
        ]}
      />,
    );

    mockGetZoom.mockResolvedValue(100);
    await user.press(screen.getByTestId('zoom-map-in'));
    await waitFor(() => expect(mockZoomTo).toHaveBeenCalledWith(16, 250));

    await user.press(screen.getByTestId('toggle-map-pitch'));
    expect(mockSetCamera).toHaveBeenLastCalledWith({ pitch: 58, animationDuration: 350 });
    await user.press(screen.getByTestId('toggle-map-pitch'));
    expect(mockSetCamera).toHaveBeenLastCalledWith({ pitch: 0, animationDuration: 350 });
  });
});
