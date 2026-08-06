import { screen, userEvent } from '@testing-library/react-native';
import { SPORTS_BTNS_VALUES } from '@Routes/save-activity-page/sports-btns/const';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ChooseSportModal from './choose-sport-modal';

jest.mock('@gorhom/bottom-sheet', () => {
  const { View } = jest.requireActual('react-native');
  return {
    BottomSheetBackdrop: View,
    BottomSheetModal: ({ children }: any) => <View>{children}</View>,
    BottomSheetModalProvider: View,
    BottomSheetView: View,
  };
});

describe('choose sport modal', () => {
  it('stores the selected sport and closes', async () => {
    const user = userEvent.setup();
    const close = jest.fn();
    await renderWithProviders(<ChooseSportModal chooseSportModalRef={{ current: { close } } as any} />);
    await user.press(screen.getByTestId(`activity-sport-${SPORTS_BTNS_VALUES.bike}`));
    expect(mockStore.getState().additionalInfoActivity.sport).toBe(SPORTS_BTNS_VALUES.bike);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
