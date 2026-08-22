import { screen, userEvent } from '@testing-library/react-native';
import { SPORTS_BTNS_VALUES } from '@const/sports';
import { changeLanguage } from '@R/slices/settings/settings';
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
    const onSportChange = jest.fn();
    await renderWithProviders(
      <ChooseSportModal
        chooseSportModalRef={{ current: { close } } as any}
        selectedSport={SPORTS_BTNS_VALUES.run}
        onSportChange={onSportChange}
      />,
    );
    await user.press(screen.getByTestId(`activity-sport-${SPORTS_BTNS_VALUES.bike}`));
    expect(onSportChange).toHaveBeenCalledWith(SPORTS_BTNS_VALUES.bike);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('renders the disabled state in English and prevents changing sport', async () => {
    const user = userEvent.setup();
    const onSportChange = jest.fn();
    const close = jest.fn();
    mockStore.dispatch(changeLanguage('english'));
    await renderWithProviders(
      <ChooseSportModal
        chooseSportModalRef={{ current: { close } } as any}
        isDisabled
        selectedSport={SPORTS_BTNS_VALUES.run}
        onSportChange={onSportChange}
      />,
    );

    expect(screen.getByText('Choose a sport')).toBeOnTheScreen();
    expect(screen.getByText('Walking')).toBeOnTheScreen();
    const bikeButton = screen.getByTestId(`activity-sport-${SPORTS_BTNS_VALUES.bike}`);
    await user.press(bikeButton);
    expect(onSportChange).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
  });
});
