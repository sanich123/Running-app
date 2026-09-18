import { screen, userEvent } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import LegalInformation from './legal-information';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@gorhom/bottom-sheet', () => {
  const { forwardRef, useImperativeHandle } = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  const BottomSheetModal = forwardRef(({ children }: any, ref: any) => {
    useImperativeHandle(ref, () => ({ present: jest.fn(), dismiss: jest.fn() }));
    return <View>{children}</View>;
  });
  return {
    BottomSheetBackdrop: View,
    BottomSheetModal,
    BottomSheetModalProvider: View,
    BottomSheetView: View,
  };
});

describe('legal information settings item', () => {
  beforeEach(() => mockPush.mockClear());

  it('opens the first three legal documents from the bottom sheet', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<LegalInformation />);

    await user.press(screen.getByTestId('legal-information-settings-row'));
    await user.press(screen.getByTestId('legal-information-agreement'));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.userAgreement}`);

    await user.press(screen.getByTestId('legal-information-consents'));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.consents}`);

    await user.press(screen.getByTestId('legal-information-privacy'));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.privacyPolicy}`);
  });
});
