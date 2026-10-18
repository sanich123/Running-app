import { fireEvent, screen } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import LegalInformationModal from './legal-information-modal';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BottomSheetBackdrop: View,
    BottomSheetModal: React.forwardRef(({ children, ...props }: any, forwardedRef: unknown) => {
      void forwardedRef;
      return <View {...props}>{children}</View>;
    }),
    BottomSheetModalProvider: ({ children }: any) => <View>{children}</View>,
    BottomSheetView: View,
  };
});

describe('LegalInformationModal', () => {
  it('dismisses and opens a selected legal document', async () => {
    const dismiss = jest.fn();
    const legalInformationModalRef = { current: { dismiss } } as never;
    await renderWithProviders(<LegalInformationModal legalInformationModalRef={legalInformationModalRef} />);

    fireEvent.press(screen.getByTestId('legal-information-privacy'));

    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.privacyPolicy}`);
  });
});
