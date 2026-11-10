import type React from 'react';
import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { listSavedOfflineMaps } from '@U/offline-map-library';
import OfflineMapPage from './offline-map-page';
import { MAPS_PAGE_COPY } from '../const';

const mockGetPack = jest.fn();
const mockBack = jest.fn();
const mockErrorToast = jest.fn();

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => ({ id: 'region-1' }),
  useRouter: () => ({ back: mockBack }),
}));
jest.mock('@rnmapbox/maps', () => ({
  __esModule: true,
  default: { offlineManager: { getPack: (...args: unknown[]) => mockGetPack(...args) } },
}));
jest.mock('@U/offline-map-library', () => ({ listSavedOfflineMaps: jest.fn() }));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: (...args: unknown[]) => mockErrorToast(...args) }));
jest.mock('../offline-maps-tab/map-region-downloader/map-region-downloader', () => {
  const ReactModule = jest.requireActual('react') as typeof React;
  const { Pressable, Text: NativeText } = jest.requireActual('react-native') as {
    Pressable: React.ComponentType<React.PropsWithChildren<{ onPress: () => void; testID: string }>>;
    Text: React.ComponentType<React.PropsWithChildren<{ testID: string }>>;
  };
  return {
    __esModule: true,
    default: (props: {
      initialIsSatellite: boolean;
      initialVisibleBounds: [[number, number], [number, number]];
      onClose: () => void;
      previewTitle: string;
    }) =>
      ReactModule.createElement(
        Pressable,
        { onPress: props.onClose, testID: 'offline-map-preview' },
        ReactModule.createElement(
          NativeText,
          { testID: 'offline-map-preview-details' },
          JSON.stringify({
            isSatellite: props.initialIsSatellite,
            bounds: props.initialVisibleBounds,
            title: props.previewTitle,
          }),
        ),
      ),
  };
});

describe('OfflineMapPage', () => {
  beforeEach(() => {
    mockGetPack.mockReset();
    jest.mocked(listSavedOfflineMaps).mockReset();
    jest.mocked(listSavedOfflineMaps).mockResolvedValue([{ id: 'region-1', title: 'Москва' }]);
    mockBack.mockReset();
    mockErrorToast.mockReset();
  });

  it('opens the saved iOS Mapbox pack and displays its saved bounds', async () => {
    mockGetPack.mockResolvedValue({
      bounds: [38, 56, 37, 55],
      metadata: { name: 'region-1', style: 'satellite' },
    });
    const user = userEvent.setup();
    await renderWithProviders(<OfflineMapPage />);

    await waitFor(() => expect(mockGetPack).toHaveBeenCalledWith('region-1'));
    expect(mockErrorToast).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId('offline-map-preview')).toBeOnTheScreen());
    expect(screen.getByTestId('offline-map-preview-details')).toHaveTextContent(
      JSON.stringify({
        isSatellite: true,
        bounds: [
          [38, 56],
          [37, 55],
        ],
        title: 'Москва',
      }),
    );

    await user.press(screen.getByTestId('offline-map-preview'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('shows an error page and reports missing or unreadable saved packs', async () => {
    mockGetPack.mockResolvedValue(undefined);
    await renderWithProviders(<OfflineMapPage />);

    expect(await screen.findByText(MAPS_PAGE_COPY[LANGUAGES.russian].mapOpenFailed)).toBeOnTheScreen();
    expect(mockErrorToast).toHaveBeenCalledWith(MAPS_PAGE_COPY[LANGUAGES.russian].mapOpenFailed, expect.any(Error));
  });
});
