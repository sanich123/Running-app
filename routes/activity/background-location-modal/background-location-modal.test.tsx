import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import BackgroundLocationModal from './background-location-modal';

jest.mock('@gorhom/bottom-sheet', () => {
  const { View } = jest.requireActual('react-native');
  return {
    BottomSheetBackdrop: View,
    BottomSheetModal: ({ children }: any) => <View>{children}</View>,
    BottomSheetModalProvider: View,
    BottomSheetView: View,
  };
});

describe('background location modal', () => {
  it('requests access and closes after permission is granted', async () => {
    const user = userEvent.setup();
    const close = jest.fn();
    const requestBackgroundPermission = jest.fn().mockResolvedValue({ granted: true });
    await renderWithProviders(
      <BackgroundLocationModal
        backgroundLocationEnabledModalRef={{ current: { close } } as any}
        requestBackgroundPermission={requestBackgroundPermission}
      />,
    );
    await user.press(screen.getByTestId('background-location-allow'));
    expect(requestBackgroundPermission).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
