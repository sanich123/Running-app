import { render, screen, userEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import NavigationProvider from './navigation-provider';

const mockUseActivityNavigation = jest.fn();

jest.mock('../use-activity-navigation', () => ({
  __esModule: true,
  default: () => mockUseActivityNavigation(),
}));

jest.mock('@S/confirm-dialog/confirm-dialog', () => {
  const { Pressable, View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ visible, onConfirm, onDismiss }: { visible: boolean; onConfirm: () => void; onDismiss: () => void }) =>
      visible ? (
        <View testID="finish-navigation-dialog">
          <Pressable testID="confirm-finish-navigation" onPress={onConfirm} />
          <Pressable testID="dismiss-finish-navigation" onPress={onDismiss} />
        </View>
      ) : null,
  };
});

jest.mock('@Routes/maps-page/offline-maps-tab/map-region-downloader/map-region-downloader', () => {
  const { Pressable, View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ onClose }: { onClose: () => void }) => (
      <View testID="embedded-offline-map-downloader">
        <Pressable testID="close-embedded-offline-map" onPress={onClose} />
      </View>
    ),
  };
});

describe('NavigationProvider', () => {
  const onConfirm = jest.fn();
  const onDismiss = jest.fn();
  const onClose = jest.fn();
  const contextValue = null;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseActivityNavigation.mockReturnValue({
      contextValue,
      finishDialog: {
        visible: true,
        labels: {
          finishNavigationConfirmTitle: 'Finish route?',
          finishNavigationConfirmMessage: 'Save this route?',
          finishNavigationConfirmAction: 'Finish',
          finishNavigationCancel: 'Continue',
        },
        onDismiss,
        onConfirm,
      },
      offlineMap: {
        request: {
          bounds: [
            [38, 56],
            [37, 55],
          ],
          centerCoordinate: [37.5, 55.5],
        },
        visible: true,
        copy: {},
        onClose,
        onDownloaded: jest.fn(),
      },
    });
  });

  it('renders its children and the active navigation overlays', async () => {
    await render(
      <NavigationProvider isLocationReady>
        <Text testID="navigation-content">Activity map</Text>
      </NavigationProvider>,
    );

    expect(screen.getByTestId('navigation-content')).toBeOnTheScreen();
    expect(screen.getByTestId('finish-navigation-dialog')).toBeOnTheScreen();
    expect(screen.getByTestId('embedded-offline-map-downloader')).toBeOnTheScreen();
  });

  it('forwards confirmation and close callbacks from its overlays', async () => {
    const user = userEvent.setup();
    await render(
      <NavigationProvider isLocationReady>
        <Text>Activity map</Text>
      </NavigationProvider>,
    );
    await user.press(screen.getByTestId('confirm-finish-navigation'));
    await user.press(screen.getByTestId('dismiss-finish-navigation'));
    await user.press(screen.getByTestId('close-embedded-offline-map'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
