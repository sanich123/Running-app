import type React from 'react';
import Mapbox from '@rnmapbox/maps';
import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { listSavedOfflineMaps } from '@U/offline-map-library';
import { MAPS_PAGE_COPY } from '../const';
import OfflineMapsTab from './offline-maps-tab';

const mockErrorToast = jest.fn();

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
  default: ({ maps }: { maps: { title: string }[] }) => {
    const ReactModule = jest.requireActual('react') as typeof React;
    const { Text: NativeText } = jest.requireActual('react-native') as {
      Text: React.ComponentType<React.PropsWithChildren>;
    };
    return ReactModule.createElement(NativeText, null, maps.map(({ title }) => title).join(', '));
  },
}));

const copy = MAPS_PAGE_COPY[LANGUAGES.russian];

describe('offline maps tab', () => {
  beforeEach(() => {
    jest.mocked(Mapbox.offlineManager.getPacks).mockReset();
    jest.mocked(listSavedOfflineMaps).mockReset();
    mockErrorToast.mockReset();
  });

  it('joins native offline packs with saved names', async () => {
    jest
      .mocked(Mapbox.offlineManager.getPacks)
      .mockResolvedValue([{ name: 'region-1' }, { name: 'region-2' }, { name: '' }] as unknown as Awaited<
        ReturnType<typeof Mapbox.offlineManager.getPacks>
      >);
    jest.mocked(listSavedOfflineMaps).mockResolvedValue([{ id: 'region-1', title: 'Москва' }]);
    await renderWithProviders(<OfflineMapsTab copy={copy} />);

    expect(await screen.findByText('Москва, region-2')).toBeOnTheScreen();
    expect(screen.getByText('—')).toBeOnTheScreen();
  });

  it('shows retry after map library loading fails', async () => {
    jest.mocked(Mapbox.offlineManager.getPacks).mockRejectedValue(new Error('offline map error'));
    jest.mocked(listSavedOfflineMaps).mockResolvedValue([]);
    await renderWithProviders(<OfflineMapsTab copy={copy} />);

    expect(await screen.findByText(copy.retry)).toBeOnTheScreen();
    expect(mockErrorToast).toHaveBeenCalledWith(copy.libraryLoadFailed, expect.any(Error));
  });
});
