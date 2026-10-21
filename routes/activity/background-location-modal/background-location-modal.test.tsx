import type { PropsWithChildren } from 'react';
import { screen, userEvent } from '@testing-library/react-native';
import { createMockBottomSheetModalRef } from '@T/utils/mock-ref';
import { renderWithProviders } from '@T/utils/test-utils';
import BackgroundLocationModal from './background-location-modal';

jest.mock('@gorhom/bottom-sheet', () => {
  const { View } = jest.requireActual('react-native');
  return {
    BottomSheetBackdrop: View,
    BottomSheetModal: ({ children }: PropsWithChildren) => <View>{children}</View>,
    BottomSheetModalProvider: View,
    BottomSheetView: View,
  };
});

const mockPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('background location modal', () => {
  it('requests access and closes after permission is granted', async () => {
    const user = userEvent.setup();
    const close = jest.fn();
    const requestBackgroundPermission = jest.fn().mockResolvedValue({ granted: true });
    await renderWithProviders(
      <BackgroundLocationModal
        backgroundLocationEnabledModalRef={createMockBottomSheetModalRef({ close })}
        requestBackgroundPermission={requestBackgroundPermission}
      />,
    );
    expect(screen.getByTestId('background-location-allow')).toBeDisabled();
    await user.press(screen.getByTestId('location-consent-checkbox'));
    await user.press(screen.getByTestId('background-location-allow'));
    expect(requestBackgroundPermission).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('closes the modal before opening the location consent page', async () => {
    const user = userEvent.setup();
    const close = jest.fn();

    await renderWithProviders(
      <BackgroundLocationModal
        backgroundLocationEnabledModalRef={createMockBottomSheetModalRef({ close })}
        requestBackgroundPermission={jest.fn()}
      />,
    );

    await user.press(screen.getByRole('link'));

    expect(close).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/location-consent');
  });
});
