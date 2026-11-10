import { createElement as mockCreateElement } from 'react';
import { screen, userEvent } from '@testing-library/react-native';
import type * as ReactNative from 'react-native';
import { setInitialLocation } from '@R/slices/location/location';
import { mockStore, resetMockLocation } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import CreateOfflineMapPage from './create-offline-map-page';

const mockBack = jest.fn();
let mockCenterParams: { centerLatitude?: string; centerLongitude?: string } = {};
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => mockCenterParams,
  useRouter: () => ({ back: mockBack }),
}));
jest.mock('../offline-maps-tab/map-region-downloader/map-region-downloader', () => {
  const { Pressable, Text, View } = jest.requireActual('react-native') as typeof ReactNative;
  return {
    __esModule: true,
    default: ({
      centerCoordinate,
      onDownloaded,
    }: {
      centerCoordinate: [number, number];
      onDownloaded: () => Promise<void>;
    }) =>
      mockCreateElement(
        View,
        null,
        mockCreateElement(Text, { testID: 'offline-map-center' }, centerCoordinate.join(',')),
        mockCreateElement(Pressable, {
          onPress: () => void onDownloaded(),
          testID: 'offline-map-downloaded',
        }),
      ),
  };
});

describe('create offline map page', () => {
  beforeEach(() => {
    mockBack.mockReset();
    mockCenterParams = {};
    mockStore.dispatch(resetMockLocation());
  });

  it('uses route coordinates and returns after the map is downloaded', async () => {
    mockCenterParams = { centerLatitude: '55.75', centerLongitude: '37.61' };
    const user = userEvent.setup();
    await renderWithProviders(<CreateOfflineMapPage />);

    expect(screen.getByTestId('offline-map-center')).toHaveTextContent('37.61,55.75');
    await user.press(screen.getByTestId('offline-map-downloaded'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('falls back to the last known location when route coordinates are invalid', async () => {
    mockCenterParams = { centerLatitude: 'invalid', centerLongitude: '200' };
    mockStore.dispatch(setInitialLocation({ timestamp: 1000, coords: { latitude: 56, longitude: 38 } }));
    await renderWithProviders(<CreateOfflineMapPage />);

    expect(screen.getByTestId('offline-map-center')).toHaveTextContent('38,56');
  });
});
