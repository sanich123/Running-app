import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import SportsBtns from './sports-btns';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ sport: 'run' }),
  useRouter: () => ({ setParams: jest.fn() }),
}));

const mockPresent = jest.fn();
jest.mock('@S/choose-sport-modal/choose-sport-modal', () => {
  const { View } = jest.requireActual('react-native');
  return ({ chooseSportModalRef }: any) => {
    chooseSportModalRef.current = { present: mockPresent };
    return <View testID="manual-sport-modal" />;
  };
});

describe('sports btns', () => {
  it('opens the sport picker for a manual activity', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<SportsBtns isDisabled={false} />);
    await user.press(screen.getByTestId('manual-activity-sport-picker'));
    expect(mockPresent).toHaveBeenCalledTimes(1);
  });

  it('uses the disabled appearance when the save page is disabled', async () => {
    await renderWithProviders(<SportsBtns isDisabled />);

    expect(screen.getByTestId('manual-activity-sport-picker')).toHaveStyle({ opacity: 0.7 });
  });

  it('uses the selected activity control style', async () => {
    await renderWithProviders(<SportsBtns isDisabled={false} />);

    expect(screen.getByTestId('manual-activity-sport-picker')).toHaveStyle({
      borderRadius: 12,
      borderWidth: 1,
      minHeight: 56,
    });
  });
});
