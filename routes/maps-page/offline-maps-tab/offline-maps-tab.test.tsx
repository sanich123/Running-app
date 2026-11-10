import type React from 'react';
import Mapbox from '@rnmapbox/maps';
import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { listSavedOfflineMaps } from '@U/offline-map-library';
import { MAPS_PAGE_COPY } from '../const';
import { OFFLINE_MAP_STORAGE_UNAVAILABLE_LABEL } from './const';
import OfflineMapsTab from './offline-maps-tab';

const mockErrorToast = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

jest.mock('@rnmapbox/maps', () => ({
  __esModule: true,
  default: { offlineManager: { getPacks: jest.fn() } },
}));
jest.mock('@U/offline-map-library', () => ({ listSavedOfflineMaps: jest.fn() }));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: (...args: unknown[]) => mockErrorToast(...args) }));
jest.mock('./map-region-downloader/map-region-downloader', () => ({
  __esModule: true,
  default: () => {
    const ReactModule = jest.requireActual('react') as typeof React;
    const { Text: NativeText } = jest.requireActual('react-native') as {
      Text: React.ComponentType<React.PropsWithChildren>;
    };
    return ReactModule.createElement(NativeText, null, 'Map region selector');
  },
}));
jest.mock('./offline-map-list/offline-map-list', () => ({
  __esModule: true,
  default: ({
    maps,
    onOpenMap,
  }: {
    maps: { id: string; title: string }[];
    onOpenMap?: (map: { id: string; title: string }) => void;
  }) => {
    const ReactModule = jest.requireActual('react') as typeof React;
    const { Pressable, Text: NativeText } = jest.requireActual('react-native') as {
      Pressable: React.ComponentType<React.PropsWithChildren<{ onPress: () => void; testID: string }>>;
      Text: React.ComponentType<React.PropsWithChildren>;
    };
    return ReactModule.createElement(
      ReactModule.Fragment,
      null,
      maps.map((offlineMap) =>
        ReactModule.createElement(
          Pressable,
          { key: offlineMap.id, onPress: () => onOpenMap?.(offlineMap), testID: `open-offline-map-${offlineMap.id}` },
          ReactModule.createElement(NativeText, null, offlineMap.title),
        ),
      ),
    );
  },
}));

const copy = MAPS_PAGE_COPY[LANGUAGES.russian];

describe('offline maps tab', () => {
  beforeEach(() => {
    jest.mocked(Mapbox.offlineManager.getPacks).mockReset();
    jest.mocked(listSavedOfflineMaps).mockReset();
    mockErrorToast.mockReset();
    mockPush.mockReset();
  });

  it('joins native offline packs with saved names', async () => {
    jest
      .mocked(Mapbox.offlineManager.getPacks)
      .mockResolvedValue([{ name: 'region-1' }, { name: 'region-2' }, { name: '' }] as unknown as Awaited<
        ReturnType<typeof Mapbox.offlineManager.getPacks>
      >);
    jest.mocked(listSavedOfflineMaps).mockResolvedValue([{ id: 'region-1', title: 'Москва' }]);
    await renderWithProviders(<OfflineMapsTab copy={copy} />);

    expect(await screen.findByText('Москва')).toBeOnTheScreen();
    expect(screen.getByText('region-2')).toBeOnTheScreen();
    expect(screen.getByText(OFFLINE_MAP_STORAGE_UNAVAILABLE_LABEL)).toBeOnTheScreen();
  });

  it('shows retry after map library loading fails', async () => {
    jest.mocked(Mapbox.offlineManager.getPacks).mockRejectedValue(new Error('offline map error'));
    jest.mocked(listSavedOfflineMaps).mockResolvedValue([]);
    await renderWithProviders(<OfflineMapsTab copy={copy} />);

    expect(await screen.findByText(copy.retry)).toBeOnTheScreen();
    expect(mockErrorToast).toHaveBeenCalledWith(copy.libraryLoadFailed, expect.any(Error));
  });

  it('opens the selected saved map as its own route', async () => {
    jest
      .mocked(Mapbox.offlineManager.getPacks)
      .mockResolvedValue([{ name: 'region-1' }] as unknown as Awaited<
        ReturnType<typeof Mapbox.offlineManager.getPacks>
      >);
    jest.mocked(listSavedOfflineMaps).mockResolvedValue([{ id: 'region-1', title: 'Москва' }]);
    const user = userEvent.setup();
    await renderWithProviders(<OfflineMapsTab copy={copy} />);

    await screen.findByText('Москва');
    await user.press(screen.getByTestId('open-offline-map-region-1'));

    expect(mockPush).toHaveBeenCalledWith({ pathname: `/${ROUTES.offlineMap}/[id]`, params: { id: 'region-1' } });
  });
});
